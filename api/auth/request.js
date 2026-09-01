// POST /api/auth/request  { email }
//
// Mints a single-use sign-in link and emails it. Always answers the same way,
// whether or not the address is a GoHighLevel user — otherwise this form
// becomes a way to enumerate who works here.

import { put, get } from "@vercel/blob";
import { lookupRole, normaliseEmail, looksLikeEmail } from "../../lib/auth.js";

const LINK_TTL_MS = 15 * 60 * 1000; // 15 minutes
const MIN_GAP_MS = 60 * 1000; // one link per address per minute

/** Same answer for every outcome. Nothing here reveals who has an account. */
const SAME_ANSWER = {
  ok: true,
  message: "If that address is on file, a sign-in link is on its way.",
};

function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Reads a private JSON blob, or null if it is absent or unreadable. */
async function readJson(key) {
  try {
    const result = await get(key, { access: "private" });
    if (result?.statusCode !== 200 || !result.stream) return null;
    return await new Response(result.stream).json();
  } catch {
    return null;
  }
}

function emailBody(link) {
  return {
    subject: "Your Funding Tier sign-in link",
    text: [
      "Here is your sign-in link for the Funding Tier tools:",
      "",
      link,
      "",
      "It works once and expires in 15 minutes.",
      "If you did not ask for this, you can ignore it — nothing has changed.",
    ].join("\n"),
    html: `
      <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;font-size:16px;line-height:1.6;color:#141a22">
        <p>Here is your sign-in link for the Funding Tier tools:</p>
        <p><a href="${link}" style="display:inline-block;background:#0c6f6b;color:#fff;text-decoration:none;padding:12px 22px;border-radius:6px;font-weight:600">Sign in</a></p>
        <p style="color:#4a5666;font-size:14px">It works once and expires in 15 minutes.</p>
        <p style="color:#6d7a8b;font-size:13px">If you did not ask for this, you can ignore it — nothing has changed.</p>
      </div>`,
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, message: "Method not allowed." });
  }

  // Name the specific missing variable. The previous version answered 503 for
  // both a missing env var and an unreachable GoHighLevel, which meant every
  // failure needed a log dive to tell apart.
  const missing = ["SESSION_SECRET", "RESEND_API_KEY", "GHL_PIT", "GHL_LOCATION_ID"]
    .filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`auth/request: missing env ${missing.join(", ")}`);
    return res.status(503).json({ ok: false, message: "Sign-in is not configured yet." });
  }

  const email = normaliseEmail(req.body?.email);
  if (!looksLikeEmail(email)) {
    // Safe to reject plainly — shape says nothing about who is on file.
    return res.status(400).json({ ok: false, message: "That does not look like an email address." });
  }

  // GoHighLevel decides. If it cannot be reached we refuse rather than guess —
  // guessing here means handing out access on a bad day for someone else's API.
  let role;
  try {
    role = await lookupRole(email);
  } catch (err) {
    console.error("auth/request: GHL lookup failed", err);
    return res.status(503).json({ ok: false, message: "Could not reach GoHighLevel. Try again in a moment." });
  }
  if (!role) return res.status(200).json(SAME_ANSWER);

  const now = Date.now();
  const gateKey = `auth/last-sent/${encodeURIComponent(email)}.json`;

  // One link per address per minute. Stops the form being used to bury someone
  // in mail, and stops a stuck client sending twenty.
  const last = await readJson(gateKey);
  if (last?.at && now - last.at < MIN_GAP_MS) {
    return res.status(200).json(SAME_ANSWER);
  }

  const token = randomToken();

  try {
    await put(
      `auth/links/${token}.json`,
      JSON.stringify({ email, role, exp: now + LINK_TTL_MS }),
      {
        access: "private",
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: false,
      }
    );
  } catch (err) {
    console.error("auth/request: could not store link token", err);
    return res.status(503).json({ ok: false, message: "Sign-in is not available right now." });
  }

  // Best effort — a failed write here must never block a real sign-in.
  put(gateKey, JSON.stringify({ at: now }), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  }).catch((err) => console.error("auth/request: rate marker write failed", err));

  const origin = process.env.PUBLIC_ORIGIN || "https://ai.fundingtier.com";

  // Carry the page they were heading for, but only ever as a path on this
  // site. An absolute URL here would turn the emailed link into an open
  // redirect that arrives looking like it came from us.
  const wanted = String(req.query?.next || "");
  const nextParam = /^\/[^/\\]/.test(wanted) ? `&next=${encodeURIComponent(wanted)}` : "";
  const link = `${origin}/api/auth/callback?token=${token}${nextParam}`;
  const body = emailBody(link);

  try {
    const sent = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Funding Tier <success@emailservice.fundingtier.com>",
        reply_to: "success@fundingtier.com",
        to: [email],
        subject: body.subject,
        text: body.text,
        html: body.html,
      }),
    });
    if (!sent.ok) {
      console.error("auth/request: resend rejected", sent.status, await sent.text());
    }
  } catch (err) {
    console.error("auth/request: send failed", err);
  }

  return res.status(200).json(SAME_ANSWER);
}
