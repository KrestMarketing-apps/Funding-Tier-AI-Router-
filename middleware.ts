// Access gate for the router.
//
// Vercel Edge Middleware, framework-agnostic form: a default-exported function
// over a standard Request. Returning a Response short-circuits; returning
// nothing lets the request through to the static file or serverless function.
//
// Web Crypto only — no node:crypto, no dependencies — because lib/session.ts
// has to run unchanged here and in the two Next apps.

import { COOKIE, readSession, type Role, type Session } from "./lib/session";

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
  { prefix: "/index.html", roles: ["admin", "agent"] },
  { prefix: "/knowledgebase", roles: ["admin", "agent"] },
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
  { prefix: "/api/auth", why: "request-link and callback" },

  // Vercel's own cron target. Protected by CRON_SECRET, not by session.
  { prefix: "/api/cleanup-plans", why: "cron, guarded by CRON_SECRET" },
];

/**
 * Handed off to other Vercel projects by the rewrites in vercel.json. Those
 * apps run this same check with this same cookie, so gating here as well would
 * mean two login redirects fighting each other.
 */
const DELEGATED = ["/profit-engine", "/agent-tools"];

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

export default async function middleware(request: Request): Promise<Response | undefined> {
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

  const session: Session | null = await readSession(readCookie(request, COOKIE), secret);

  const rule = RULES.find((r) => matches(pathname, r.prefix));
  const allowed: Role[] = rule ? rule.roles : ["admin"]; // unlisted ⇒ admin only

  if (session && allowed.includes(session.role)) return;

  // Assets 404 rather than redirect, so a browser never parses an HTML
  // redirect as JavaScript or CSS and reports a baffling syntax error.
  if (/\.[a-z0-9]+$/i.test(pathname) && !pathname.endsWith(".html")) {
    return new Response(null, { status: 404 });
  }

  if (session) return redirect(request, "/no-access");

  const next = pathname === "/" ? "" : `?next=${encodeURIComponent(pathname)}`;
  return redirect(request, "/login", next);
}
