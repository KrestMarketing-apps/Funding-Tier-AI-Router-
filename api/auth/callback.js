// GET /api/auth/callback?token=...
//
// Verifies a sign-in link, mints the ft_session cookie, and sends the person
// on. The link is deleted as it is used, so a forwarded email or a browser
// history entry cannot sign anyone in twice.

import { get, del } from "@vercel/blob";
import { signSession, cookieHeader, MAX_AGE_S, lookupRole, lookupName } from "../../lib/auth.js";

function fail(res, message) {
  // Deliberately vague, and never says whether the token existed. Someone
  // guessing tokens learns nothing from the difference.
  res.setHeader("content-type", "text/html; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  return res.status(400).send(`<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Sign-in link problem</title>
<style>
  body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f4f6f8;color:#141a22;
       font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
  .card{max-width:26rem;padding:2rem;text-align:center}
  h1{font-size:1.25rem;margin:0 0 .5rem}
  p{color:#4a5666;line-height:1.6;margin:0 0 1.25rem}
  a{display:inline-block;background:#0c6f6b;color:#fff;text-decoration:none;
    padding:.7rem 1.4rem;border-radius:6px;font-weight:600}
</style>
<div class="card">
  <h1>That link didn't work</h1>
  <p>${message}</p>
  <a href="/login">Request a new link</a>
</div>`);
}

export default async function handler(req, res) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    console.error("auth/callback: SESSION_SECRET missing");
    return fail(res, "Sign-in is not available right now.");
  }

  const token = String(req.query?.token || "");
  if (!/^[a-f0-9]{64}$/.test(token)) {
    return fail(res, "Sign-in links expire after 15 minutes and work only once.");
  }

  const key = `auth/links/${token}.json`;

  // get() resolves to { statusCode, stream, blob } — the body comes off the
  // stream, not from a URL. Reading it any other way silently yields nothing
  // and every valid link looks expired.
  let record = null;
  try {
    const result = await get(key, { access: "private" });
    if (result?.statusCode === 200 && result.stream) {
      record = await new Response(result.stream).json();
    }
  } catch (err) {
    console.error("auth/callback: token read failed", err);
  }

  // Burn it whether or not it was valid, so a token can never be tried twice.
  del(key).catch(() => {});

  if (!record?.email || !record?.exp || record.exp < Date.now()) {
    return fail(res, "Sign-in links expire after 15 minutes and work only once.");
  }

  // Ask GoHighLevel again at redemption rather than trusting the role stamped
  // into the link. Someone removed in the fifteen minutes between requesting
  // and clicking should not still get in, and someone promoted should land on
  // their new level.
  let role;
  try {
    role = await lookupRole(record.email);
  } catch (err) {
    console.error("auth/callback: GHL lookup failed", err);
    return fail(res, "Sign-in is not available right now. Try again in a moment.");
  }
  if (!role) {
    return fail(res, "That address no longer has access.");
  }

  const name = await lookupName(record.email);

  const maxAge = MAX_AGE_S[role] ?? MAX_AGE_S.agent;
  const session = await signSession({ email: record.email, name, role }, secret, maxAge);

  // Only ever a path on this site — never an absolute URL from the query
  // string, which would make this an open redirect.
  const raw = String(req.query?.next || "");
  const next = /^\/[^/\\]/.test(raw) ? raw : "/";

  res.setHeader("Set-Cookie", cookieHeader(session, maxAge));
  res.setHeader("cache-control", "no-store");
  res.setHeader("x-robots-tag", "noindex, nofollow");
  res.statusCode = 302;
  res.setHeader("Location", next);
  return res.end();
}
