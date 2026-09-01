// Shared pieces for the email sign-in flow.
//
// GoHighLevel is the source of truth for who exists and what level they are.
// There is no local list of users to keep in step — add someone in GHL and
// they can sign in by email; remove them and the door closes on its own.
//
// Node runtime (serverless functions), but deliberately Web Crypto only, so
// the token minted here is byte-identical to what middleware.ts verifies.
//
//   Session format source of truth: Funding-Tier-Profit-Engine/lib/session.ts
//   Verifier: middleware.ts in this repo
//   Role mapping mirrors: Funding-Tier-Profit-Engine/lib/ghl.ts
//   If any of those change, change this in the same commit.

const te = new TextEncoder();

function b64url(bytes) {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(payload, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    te.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, te.encode(payload));
  return b64url(new Uint8Array(sig));
}

/** Mints the same `<payload>.<sig>` token middleware.ts reads. */
export async function signSession(session, secret, maxAgeSeconds) {
  const full = { ...session, exp: Date.now() + maxAgeSeconds * 1000 };
  const payload = b64url(te.encode(JSON.stringify(full)));
  return `${payload}.${await hmac(payload, secret)}`;
}

export const COOKIE = "ft_session";

/**
 * Admins get a shorter session than agents.
 *
 * Email possession is the only proof on this path, and the admin tier holds
 * the payout and profitability models. Two hours covers a working stretch;
 * twelve would leave a compromised mailbox useful all day.
 */
export const MAX_AGE_S = { admin: 60 * 60 * 2, agent: 60 * 60 * 12 };

export function cookieHeader(token, maxAgeSeconds) {
  // SameSite=None so the cookie still resolves inside GoHighLevel's iframe.
  // Secure is mandatory alongside it; frame-ancestors is what stops another
  // site framing the tools and riding this cookie.
  return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=${maxAgeSeconds}`;
}

export function normaliseEmail(input) {
  return String(input || "").trim().toLowerCase();
}

/** Rough shape check. GoHighLevel is what actually authorises. */
export function looksLikeEmail(email) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

/**
 * Same rules as lib/ghl.ts in the Profit Engine, so a person lands on the same
 * level whichever door they came through.
 *
 * Anything unrecognised returns null and is refused rather than defaulted — a
 * role type GoHighLevel invents later must not quietly inherit admin.
 */
function mapRole(user) {
  if (user?.roles?.type === "agency") return "admin";
  const role = String(user?.roles?.role || "").toLowerCase();
  if (role === "admin") return "admin";
  if (role === "user") return "agent";
  return null;
}

// Serverless instances get reused, so a short cache spares GoHighLevel a call
// per sign-in attempt without letting a removal go stale for long.
let cache = { at: 0, users: null };
const CACHE_MS = 60 * 1000;

async function fetchUsers() {
  const token = process.env.GHL_PIT;
  const locationId = process.env.GHL_LOCATION_ID;
  if (!token || !locationId) {
    throw new Error("GHL_PIT or GHL_LOCATION_ID missing");
  }

  if (cache.users && Date.now() - cache.at < CACHE_MS) return cache.users;

  const res = await fetch(
    `https://services.leadconnectorhq.com/users/?locationId=${encodeURIComponent(locationId)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Version: "2021-07-28",
        Accept: "application/json",
      },
    }
  );

  if (!res.ok) {
    throw new Error(`GHL users lookup failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const users = Array.isArray(data?.users) ? data.users : [];
  cache = { at: Date.now(), users };
  return users;
}

/**
 * Ask GoHighLevel what level this address is, if any.
 *
 * Returns "admin", "agent", or null for someone who is not a user on the
 * sub-account. Throws if GHL cannot be reached — callers must fail closed
 * rather than guess, because guessing here means handing out access.
 */
export async function lookupRole(email) {
  const wanted = normaliseEmail(email);
  const users = await fetchUsers();
  const user = users.find((u) => normaliseEmail(u?.email) === wanted);
  if (!user) return null;
  return mapRole(user);
}

/** Display name for the session, when GoHighLevel has one. */
export async function lookupName(email) {
  const wanted = normaliseEmail(email);
  try {
    const users = await fetchUsers();
    const user = users.find((u) => normaliseEmail(u?.email) === wanted);
    const name =
      user?.name ||
      [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
    return name || undefined;
  } catch {
    return undefined;
  }
}
