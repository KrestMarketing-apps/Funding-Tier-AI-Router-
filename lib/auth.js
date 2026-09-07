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

function b64urlDecode(str) {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  return atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

/**
 * Verifies a session cookie. Same checks middleware.ts makes — endpoints that
 * need to know WHO someone is have to read it themselves, because middleware
 * only decides whether to let the request through.
 */
export async function readSession(token, secret) {
  if (!token) return null;
  const [payload, sig] = String(token).split(".");
  if (!payload || !sig) return null;
  if (!safeEqual(sig, await hmac(payload, secret))) return null;
  try {
    const session = JSON.parse(b64urlDecode(payload));
    if (!session?.exp || session.exp < Date.now()) return null;
    if (session.role !== "admin" && session.role !== "agent") return null;
    return session;
  } catch {
    return null;
  }
}

/** Pulls one cookie out of a request header. */
export function readCookie(req, name) {
  const header = req.headers?.cookie;
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim();
  }
  return undefined;
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

// How stale a previously-successful fetch is still allowed to be when GHL is
// having a bad moment. This is the actual fix for "Could not reach
// GoHighLevel" showing up on ordinary sign-ins: a single failed request no
// longer fails the whole login, it falls back to the last known-good list.
// 30 minutes is short enough that a real de-provisioning in GHL still closes
// the door within a login session or two, and long enough to ride out a
// transient GHL outage or rate-limit window without anyone noticing.
const STALE_MAX_MS = 30 * 60 * 1000;

const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);
const FETCH_TIMEOUT_MS = 6000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** One attempt at the GHL users list, with a hard timeout so a hung request
 *  doesn't eat the whole retry budget. Throws on any non-2xx or network
 *  failure; the caller decides whether that's worth retrying. */
async function fetchUsersOnce(token, locationId) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(
      `https://services.leadconnectorhq.com/users/?locationId=${encodeURIComponent(locationId)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Version: "2021-07-28",
          Accept: "application/json",
        },
        signal: controller.signal,
      }
    );
    if (!res.ok) {
      const err = new Error(`GHL users lookup failed: ${res.status} ${await res.text()}`);
      err.status = res.status;
      throw err;
    }
    const data = await res.json();
    return Array.isArray(data?.users) ? data.users : [];
  } finally {
    clearTimeout(timer);
  }
}

async function fetchUsers() {
  // Trimmed: a trailing newline from a copy-paste reads as an invalid token.
  const token = (process.env.GHL_PIT || "").trim();
  const locationId = (process.env.GHL_LOCATION_ID || "").trim();
  if (!token || !locationId) {
    throw new Error("GHL_PIT or GHL_LOCATION_ID missing");
  }

  if (cache.users && Date.now() - cache.at < CACHE_MS) return cache.users;

  // Up to 3 attempts total. A network blip or a 429/5xx from GHL is worth
  // retrying with backoff; an auth/config problem (401/403/etc.) is not — it
  // will fail the same way every time, so surface it immediately instead of
  // burning the retry budget and making a real outage take longer to notice.
  const delays = [300, 900];
  let lastErr;
  for (let attempt = 0; attempt <= delays.length; attempt++) {
    try {
      const users = await fetchUsersOnce(token, locationId);
      cache = { at: Date.now(), users };
      return users;
    } catch (err) {
      lastErr = err;
      const retryable = err.name === "AbortError" || !err.status || RETRYABLE_STATUS.has(err.status);
      if (!retryable || attempt === delays.length) break;
      await sleep(delays[attempt]);
    }
  }

  // Every attempt failed. Rather than fail the sign-in outright, fall back to
  // the last successful fetch if it's recent enough — GHL having a bad moment
  // shouldn't be something anyone on the team ever has to "try again in a
  // moment" for.
  if (cache.users && Date.now() - cache.at < STALE_MAX_MS) {
    console.error("auth: GHL unreachable, serving cached user list", {
      ageMs: Date.now() - cache.at,
      err: String(lastErr),
    });
    return cache.users;
  }

  throw lastErr;
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
