// GET or POST /api/auth/signout
//
// Clears the session cookie and returns to the sign-in page. The cookie
// attributes have to match exactly how it was set, or the browser keeps the
// old one and the person stays signed in.

import { COOKIE } from "../../lib/auth.js";

export default async function handler(req, res) {
  res.setHeader(
    "Set-Cookie",
    `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0`
  );
  res.setHeader("cache-control", "no-store");

  // A fetch() from the toolkit wants JSON; a plain link wants to land back on
  // the sign-in page.
  if ((req.headers?.accept || "").includes("application/json")) {
    return res.status(200).json({ ok: true });
  }

  res.statusCode = 302;
  res.setHeader("Location", "/login");
  return res.end();
}
