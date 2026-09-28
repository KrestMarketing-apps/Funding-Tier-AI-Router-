import { put } from '@vercel/blob';
import { randomUUID } from 'node:crypto';
import { programContentFor } from '../agents/prospect-program-content.js';

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
      rows = [],
      programKey = '',
      programSelection = 'default',
      doNothingMinimumOnly = {},
      creditRunway = null
    } = req.body || {};

    const n = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

    // Program copy comes from the server-side library, keyed by a whitelisted
    // route key — the browser never supplies prospect-facing wording.
    const content = programContentFor(String(programKey || ''));
    const program = content
      ? {
          key: content.key,
          publicName: content.publicName,
          paymentLabel: content.paymentLabel,
          tagline: content.tagline,
          howItWorks: content.howItWorks,
          benefits: content.benefits,
          disclosure: content.disclosure,
          monthlyPayment: Math.round(n(recommended.monthlyPayment)),
          term: Math.round(n(recommended.term)),
          totalCost: Math.round(n(recommended.totalCost)),
          selection: ['default', 'lowest_price', 'agent_selected'].includes(programSelection)
            ? programSelection
            : 'default'
        }
      : null;

    const minimumOnly = {
      startingMinimumPayment: Math.round(n(doNothingMinimumOnly.startingMinimumPayment)),
      monthsToPayoff: Math.round(n(doNothingMinimumOnly.monthsToPayoff)),
      yearsMonths: String(doNothingMinimumOnly.yearsMonths || '').slice(0, 60),
      interestCost: Math.round(n(doNothingMinimumOnly.interestCost)),
      totalPayback: Math.round(n(doNothingMinimumOnly.totalPayback)),
      dailyInterest: Math.round(n(doNothingMinimumOnly.dailyInterest) * 100) / 100,
      monthlyInterest: Math.round(n(doNothingMinimumOnly.monthlyInterest))
    };

    const safeRows = Array.isArray(rows) ? rows.slice(0, MAX_ROWS) : [];

    const fullName = `${firstName} ${lastName}`.trim();
    const token = randomUUID();
    // Credit runway on open (not-in-collections) cards — numbers only.
    const cleanRunwayScenario = (sc) => {
      const at = {};
      [3, 6, 12, 18, 24, 36].forEach((m) => { at[m] = Math.round(n(sc?.availableAt?.[m])); });
      const mm = n(sc?.monthsToMaxOut);
      return { monthsToMaxOut: mm > 0 ? Math.round(mm) : null, availableAt: at, interestNext12: Math.round(n(sc?.interestNext12)) };
    };
    const runway = creditRunway && n(creditRunway.creditLimit) > n(creditRunway.openBalance) && n(creditRunway.openBalance) > 0
      ? {
          openBalance: Math.round(n(creditRunway.openBalance)),
          creditLimit: Math.round(n(creditRunway.creditLimit)),
          availableCredit: Math.round(n(creditRunway.availableCredit)),
          aprPercent: Math.round(n(creditRunway.aprPercent) * 100) / 100,
          monthlyPayment: Math.round(n(creditRunway.monthlyPayment)),
          paymentIsEstimate: !!creditRunway.paymentIsEstimate,
          monthlyInterest: Math.round(n(creditRunway.monthlyInterest)),
          interestShareOfPayment: creditRunway.interestShareOfPayment == null ? null : Math.round(n(creditRunway.interestShareOfPayment)),
          paymentCoversInterest: !!creditRunway.paymentCoversInterest,
          atCurrentPayment: cleanRunwayScenario(creditRunway.atCurrentPayment),
          ifPaymentsStop: cleanRunwayScenario(creditRunway.ifPaymentsStop)
        }
      : null;

    const savings = Math.max(
      0,
      Number(doNothing.totalPayback || 0) - Number(recommended.totalCost || 0)
    );
    const savingsVsMinimumOnly = Math.max(
      0,
      minimumOnly.totalPayback - Number(recommended.totalCost || 0)
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
      savingsVsMinimumOnly,
      program,
      minimumOnly,
      creditRunway: runway,
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
