import { put } from '@vercel/blob';
import { randomUUID } from 'node:crypto';

// How long a generated plan link stays viewable.
const PLAN_TTL_DAYS = 45;

// Abuse brake: a real plan never has this many creditor rows.
const MAX_ROWS = 100;

/**
 * Cosmetic first-name segment for the plan URL.
 * NOT used for lookup — api/plan.js ignores it entirely and resolves by token.
 * Folds accents, strips anything non-alphanumeric (kills path traversal and
 * tag characters), caps length, and falls back to 'client'.
 */
function nameSegment(text) {
  const s = String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24)
    .replace(/-+$/g, '');
  return s || 'client';
}

function getOrigin(req) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host;
  return `${proto}://${host}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  try {
    const {
      firstName = 'Client',
      lastName = '',
      email = '',
      state = '',
      totalDebt = 0,
      doNothing = {},
      shortest = {},
      recommended = {},
      route = '',
      routeReason = '',
      rows = []
    } = req.body || {};

    const safeRows = Array.isArray(rows) ? rows.slice(0, MAX_ROWS) : [];

    const fullName = `${firstName} ${lastName}`.trim();
    const token = randomUUID();
    const savings = Math.max(
      0,
      Number(doNothing.totalPayback || 0) - Number(recommended.totalCost || 0)
    );

    const now = new Date();
    const expiresAt = new Date(now.getTime() + PLAN_TTL_DAYS * 86400000);

    const planData = {
      token,
      firstName,
      lastName,
      fullName,
      email,
      state,
      totalDebt,
      doNothing,
      shortest,
      recommended,
      route,
      routeReason,
      rows: safeRows,
      savings,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    };

    // Private store: the object is not reachable by URL. Only api/plan.js,
    // holding BLOB_READ_WRITE_TOKEN, can read it back.
    await put(`plans/${token}.json`, JSON.stringify(planData, null, 2), {
      access: 'private',
      contentType: 'application/json'
    });

    const origin = getOrigin(req);
    const pageUrl = `${origin}/plan/${nameSegment(firstName)}/${token}`;

    // Deliberately does NOT return the raw blob URL.
    return res.status(200).json({
      ok: true,
      pageUrl,
      expiresAt: planData.expiresAt,
      route
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message || 'Server error'
    });
  }
}
