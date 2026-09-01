// GET /api/me
//
// Who is this, and what may they open? The toolkit header asks this once on
// load. Filtering happens here rather than in the browser, so an agent's
// machine never receives the admin entries at all.

import { COOKIE, readSession, readCookie } from "../lib/auth.js";
import { sectionsFor, CRM } from "../lib/tools.js";

export default async function handler(req, res) {
  res.setHeader("cache-control", "no-store");

  const secret = process.env.SESSION_SECRET;
  const session = secret
    ? await readSession(readCookie(req, COOKIE), secret)
    : null;

  if (!session) {
    return res.status(401).json({ ok: false, signedIn: false });
  }

  return res.status(200).json({
    ok: true,
    signedIn: true,
    user: {
      email: session.email,
      name: session.name || null,
      role: session.role,
    },
    sections: sectionsFor(session.role),
    crm: CRM,
  });
}
