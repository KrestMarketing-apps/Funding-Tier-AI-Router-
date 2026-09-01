// Access gate for the router.
//
// Vercel Edge Middleware, framework-agnostic form: a default-exported function
// over a standard Request. Returning a Response short-circuits; returning
// nothing lets the request through to the static file or serverless function.
//
// SELF-CONTAINED ON PURPOSE. No imports — this repo has no tsconfig, no
// @types/node and no build step of its own, and an import here has to survive
// both Vercel's type-check and its edge bundler. The session-reading half of
// lib/session.ts is mirrored below instead.
//
//   Source of truth: Funding-Tier-Profit-Engine/lib/session.ts
//   If the token format changes there, change it here in the same commit.
//   Verification only — nothing in this file mints a session.

// Edge middleware only ever sees process.env, and this repo has no node types.
declare const process: { env: Record<string, string | undefined> };

type Role = "admin" | "agent";

type Session = {
  email: string;
  name?: string;
  role: Role;
  loc?: string;
  exp: number;
};

const COOKIE = "ft_session";

const te = new TextEncoder();

function b64urlDecode(s: string): string {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/");
  return atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
}

async function hmac(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    te.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, te.encode(payload));
  const bytes = new Uint8Array(sig);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Length-independent compare, so a wrong signature leaks no timing signal. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

async function readSession(
  token: string | undefined,
  secret: string
): Promise<Session | null> {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  if (!safeEqual(sig, await hmac(payload, secret))) return null;
  try {
    const session = JSON.parse(b64urlDecode(payload)) as Session;
    if (!session?.exp || session.exp < Date.now()) return null;
    if (session.role !== "admin" && session.role !== "agent") return null;
    return session;
  } catch {
    return null;
  }
}

export const config = {
  // Everything. Exclusions are decided in code below, where they can carry a
  // reason, rather than in a regex nobody can read six months from now.
  matcher: "/:path*",
};

/**
 * What each prefix needs. First match wins, so order matters: longer and more
 * specific prefixes go above the broader ones they sit inside.
 *
 * Anything not listed here requires admin. That default is the point — a tool
 * added next month is locked before anyone remembers to write a rule for it.
 * Opening something up is a deliberate line in this table.
 */
const RULES: Array<{ prefix: string; roles: Role[] }> = [
  { prefix: "/admins", roles: ["admin"] },
  { prefix: "/api/admins", roles: ["admin"] },

  { prefix: "/agents", roles: ["admin", "agent"] },
  { prefix: "/api/agents", roles: ["admin", "agent"] },

  // The deal router itself and the tools agents use on live calls.
  //
  // "/" has to be listed separately from "/index.html": cleanUrls is on, so
  // middleware sees the bare "/" and never the filename. Note that matches()
  // only ever equals "/" exactly — it cannot swallow the whole site, because
  // no real path starts with "//".
  { prefix: "/", roles: ["admin", "agent"] },
  { prefix: "/index.html", roles: ["admin", "agent"] },
  { prefix: "/knowledgebase", roles: ["admin", "agent"] },

  // The deal router posts here to build a plan, so it needs the same level as
  // the page that calls it. Admin-only here would break agents mid-call.
  { prefix: "/api/generate-plan", roles: ["admin", "agent"] },

  // The toolkit header asks who you are and what you may open. It filters by
  // role server-side, so an agent's browser never receives the admin entries.
  { prefix: "/api/me", roles: ["admin", "agent"] },

  // Admin-only for now. Both would fall here anyway under the default, but
  // saying so out loud means the next person can tell "decided" from "nobody
  // got round to it" — and flipping either one is a one-word edit.
  { prefix: "/legacy-support", roles: ["admin"] },
  { prefix: "/credit-card-calculator", roles: ["admin"] }, // still being built
];

/**
 * Reachable with no session at all, each for a stated reason. Nothing goes in
 * here because it is inconvenient to sign in for.
 */
const PUBLIC: Array<{ prefix: string; why: string }> = [
  // Prospects open their own plan from an emailed link. The expiring UUID in
  // the URL is the credential; requiring a Funding Tier session would break
  // every plan already sent.
  { prefix: "/plan", why: "prospect-facing, token in URL is the credential" },
  { prefix: "/api/plan", why: "backs /plan" },

  // Sign-in itself, and the endpoints it posts to.
  { prefix: "/login", why: "the sign-in page" },
  { prefix: "/no-access", why: "the wrong-level page" },
  { prefix: "/api/auth", why: "request-link, callback and sign-out" },

  // The toolkit script itself carries no data — everything it shows comes
  // from /api/me, which is gated. Public so it can load on the sign-in page
  // and from tools on other Vercel projects.
  { prefix: "/toolkit.js", why: "shared header, contains no data of its own" },

  // Vercel's own cron target. Protected by CRON_SECRET, not by session.
  { prefix: "/api/cleanup-plans", why: "cron, guarded by CRON_SECRET" },
];

/**
 * Handed off to other Vercel projects by the rewrites in vercel.json. Those
 * apps run this same check with this same cookie, so gating here as well would
 * mean two login redirects fighting each other.
 */
const DELEGATED = ["/profit-engine", "/agent-tools"];

/**
 * Where someone with no session gets sent.
 *
 * /login takes an email and sends a one-time link, so nobody needs the CRM
 * open. Opening a tool from inside GoHighLevel still works and mints the same
 * cookie — two doors, one session.
 */
const SIGN_IN: string = "/login";

/** Assets that must resolve before a session exists, or the login page is bare. */
const OPEN_FILES = new Set([
  "/favicon.ico",
  "/favicon-32x32.png",
  "/apple-touch-icon.png",
  "/android-chrome-192x192.png",
  "/robots.txt",
]);

function matches(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(prefix + "/");
}

function readCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get("cookie");
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim();
  }
  return undefined;
}

function redirect(request: Request, path: string, search = ""): Response {
  const origin = new URL(request.url).origin;
  return new Response(null, {
    status: 307,
    headers: {
      location: `${origin}${path}${search}`,
      "x-robots-tag": "noindex, nofollow",
      "cache-control": "no-store",
    },
  });
}

export default async function middleware(
  request: Request
): Promise<Response | undefined> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    // Fail closed. A router with no secret cannot tell anyone apart, and the
    // alternative is serving the payout model to the open internet.
    return new Response("This site is not configured for access yet.", {
      status: 503,
      headers: { "cache-control": "no-store" },
    });
  }

  const { pathname } = new URL(request.url);

  if (DELEGATED.some((p) => matches(pathname, p))) return;
  if (OPEN_FILES.has(pathname)) return;
  if (PUBLIC.some((p) => matches(pathname, p.prefix))) return;

  // Vercel's own plumbing — never ours to gate.
  if (pathname.startsWith("/_vercel")) return;

  const session: Session | null = await readSession(
    readCookie(request, COOKIE),
    secret
  );

  const rule = RULES.find((r) => matches(pathname, r.prefix));
  const allowed: Role[] = rule ? rule.roles : ["admin"]; // unlisted ⇒ admin only

  if (session && allowed.includes(session.role)) return;

  // Assets 404 rather than redirect, so a browser never parses an HTML
  // redirect as JavaScript or CSS and reports a baffling syntax error.
  if (/\.[a-z0-9]+$/i.test(pathname) && !pathname.endsWith(".html")) {
    return new Response(null, { status: 404 });
  }

  if (session) return redirect(request, "/no-access");

  const next =
    SIGN_IN === "/login" && pathname !== "/"
      ? `?next=${encodeURIComponent(pathname)}`
      : "";
  return redirect(request, SIGN_IN, next);
}
