import { randomUUID } from 'node:crypto';
import { put } from '@vercel/blob';
import { createRequire } from 'node:module';
import { programContentFor } from '../../agents/prospect-program-content.js';

const require = createRequire(import.meta.url);
const pricing = require('../../lib/program-pricing.js');

async function updateGhlContact(contactId, fields = {}) {
  const payload = {};

  if (fields.customFields && Array.isArray(fields.customFields)) {
    payload.customFields = fields.customFields;
  }

  const res = await fetch(
    `https://services.leadconnectorhq.com/contacts/${contactId}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${process.env.GHL_API_KEY}`,
        Version: '2021-07-28',
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  const text = await res.text();

  return {
    ok: res.ok,
    status: res.status,
    text,
  };
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toNumber(value) {
  if (value == null) return 0;
  const cleaned = String(value).replace(/[^0-9.-]/g, '');
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
}

function round(value) {
  return Math.round(Number(value || 0));
}

function buildRows(body) {
  const rows = [];

  for (let i = 1; i <= 6; i += 1) {
    const creditorName =
      body[`creditor_${i}_name`] ||
      body[`creditor${i}Name`] ||
      '';

    const amount =
      body[`creditor_${i}_balance`] ||
      body[`creditor${i}Balance`] ||
      '';

    const numericAmount = toNumber(amount);

    if (String(creditorName).trim() || numericAmount > 0) {
      rows.push({
        creditorName: String(creditorName || '').trim() || 'Unknown Creditor',
        manualName: '',
        amount: numericAmount,
        debtType: 'Unsecured',
      });
    }
  }

  return rows;
}

// Pricing and "do nothing" math come from the shared module so a webhook plan
// matches what the router UI would produce for the same debt and state.
const PLAN_TTL_DAYS = 45;
const DEFAULT_APR_PERCENT = 28;

function buildPlanData({ firstName, lastName, email, state, rows, currentPayment }) {
  const totalDebt = round(rows.reduce((sum, row) => sum + toNumber(row.amount), 0));
  const apr = DEFAULT_APR_PERCENT;

  // Every webhook row is an unsecured, not-in-collections account, so the
  // whole balance accrues interest on the current path.
  const startMin = Math.round(pricing.startingMinimumPayment(totalDebt, apr));
  const payment = toNumber(currentPayment) > 0 ? round(currentPayment) : startMin;
  const paymentIsEntered = toNumber(currentPayment) > 0;
  const fixed = totalDebt > 0 ? pricing.fixedPaymentPayoff(totalDebt, apr, payment) : null;
  const minOnly = totalDebt > 0 ? pricing.minimumOnlyPayoff(totalDebt, apr) : null;

  const priced = pricing.priceAll(totalDebt, state);
  const routeKey = priced.defaultRoute;
  const est = routeKey ? priced.programs[routeKey] : null;
  const content = routeKey ? programContentFor(routeKey) : null;

  const program = content && est
    ? {
        key: content.key,
        publicName: content.publicName,
        paymentLabel: content.paymentLabel,
        tagline: content.tagline,
        howItWorks: content.howItWorks,
        benefits: content.benefits,
        disclosure: content.disclosure,
        debtOutcome: content.debtOutcome || '',
        monthlyPayment: est.mp,
        term: est.term,
        totalCost: est.tc,
        selection: 'default'
      }
    : null;

  const recommended = est
    ? { monthlyPayment: est.mp, term: est.term, totalCost: est.tc, serviceFeePct: est.serviceFeePct || null }
    : { monthlyPayment: 0, term: 0, totalCost: 0 };

  const doNothing = {
    monthlyPayment: payment,
    paymentIsEntered,
    startingMinimumPayment: startMin,
    neverPaysOff: !!(fixed && fixed.neverPaysOff),
    monthsToPayoff: fixed && !fixed.neverPaysOff ? fixed.months : 0,
    yearsMonths: fixed && !fixed.neverPaysOff ? pricing.yearsMonths(fixed.months) : 'Does not pay off',
    apr: apr / 100,
    aprPercent: apr,
    totalPayback: fixed && !fixed.neverPaysOff ? fixed.paid : 0,
    interestCost: fixed && !fixed.neverPaysOff ? fixed.interest : 0,
    balanceAt36: fixed ? fixed.balanceAt36 : 0,
    interestAt36: fixed ? fixed.interestAt36 : 0,
    paidAt36: fixed ? fixed.paidAt36 : 0,
    interestBearingBalance: totalDebt,
    noInterestBalance: 0,
    assumption: 'Assumes no new purchases, no late payments, no added fees, no penalty APR, and no APR changes.'
  };

  const minimumOnly = minOnly && minOnly.ok
    ? {
        startingMinimumPayment: startMin,
        monthsToPayoff: minOnly.months,
        yearsMonths: pricing.yearsMonths(minOnly.months),
        interestCost: minOnly.interest,
        totalPayback: minOnly.paid,
        dailyInterest: Math.round((totalDebt * (apr / 100) / 365) * 100) / 100,
        monthlyInterest: round(totalDebt * (apr / 100) / 12)
      }
    : { startingMinimumPayment: startMin, monthsToPayoff: 0, yearsMonths: '', interestCost: 0, totalPayback: 0, dailyInterest: 0, monthlyInterest: 0 };

  const savings = doNothing.neverPaysOff ? 0 : Math.max(0, doNothing.totalPayback - recommended.totalCost);
  const savingsVsMinimumOnly = Math.max(0, minimumOnly.totalPayback - recommended.totalCost);

  const now = new Date();
  return {
    firstName: firstName || '',
    lastName: lastName || '',
    fullName: [firstName, lastName].filter(Boolean).join(' '),
    email: email || '',
    state: state || '',
    totalDebt,
    doNothing,
    shortest: null,
    recommended,
    route: routeKey,
    routeReason: routeKey ? 'Webhook plan priced with the shared program pricing module.' : 'No eligible program for this state and debt amount.',
    rows,
    savings,
    savingsVsMinimumOnly,
    program,
    minimumOnly,
    creditRunway: null,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + PLAN_TTL_DAYS * 86400000).toISOString()
  };
}

export async function POST(req) {
  const expected = process.env.ROUTER_SHARED_SECRET;
  if (!expected || req.headers.get('x-router-secret') !== expected) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const body = await req.json();

    const contactId =
      body.contactId ||
      body.contact_id ||
      body.contact?.id ||
      null;

    const firstName =
      body.firstName ||
      body.first_name ||
      body.contact?.firstName ||
      '';

    const lastName =
      body.lastName ||
      body.last_name ||
      body.contact?.lastName ||
      '';

    const email =
      body.email ||
      body.contact?.email ||
      '';

    const state =
      body.state ||
      body.contact?.state ||
      '';

    if (!contactId) {
      return Response.json(
        {
          ok: false,
          error: 'Missing contactId',
          receivedBody: body,
        },
        { status: 400 }
      );
    }

    const rows = buildRows(body);
    const currentPayment =
      body.currentMonthlyPayment ||
      body.current_monthly_payment ||
      body.contact?.currentMonthlyPayment ||
      '';
    const planData = buildPlanData({
      firstName,
      lastName,
      email,
      state,
      rows,
      currentPayment,
    });

    if (planData.totalDebt < pricing.ROUTING.csMin || !planData.program) {
      return Response.json(
        { ok: false, error: 'No eligible program for this debt amount and state; plan not generated.', totalDebt: planData.totalDebt, state },
        { status: 422 }
      );
    }

    const slug = randomUUID();
    const planId = slug;
    planData.token = slug;

    const blob = await put(
      `plans/${slug}.json`,
      JSON.stringify(planData, null, 2),
      {
        access: 'private',
        contentType: 'application/json',
      }
    );

    const baseUrl = 'https://ai.fundingtier.com';
    const planUrl = `${baseUrl}/plan/${slugify(firstName) || 'client'}/${slug}`;
    const generatedAt = new Date().toISOString();

    const ghlUpdate = await updateGhlContact(contactId, {
      customFields: [
        {
          key: 'debt_resolution_plan_last_generated_timestamp',
          field_value: generatedAt,
        },
        {
          key: 'debt_resolution_plan_id',
          field_value: planId,
        },
        {
          key: 'debt_resolution_plan_url',
          field_value: planUrl,
        },
      ],
    });

    return Response.json({
      ok: ghlUpdate.ok,
      status: ghlUpdate.status,
      message: 'Router webhook processed and plan JSON saved',
      received: {
        contactId,
        firstName,
        lastName,
        email,
        state,
      },
      writtenFields: {
        debt_resolution_plan_last_generated_timestamp: generatedAt,
        debt_resolution_plan_id: planId,
        debt_resolution_plan_url: planUrl,
      },
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({
    ok: true,
    message: 'Router endpoint is live. Send POST requests from GHL.',
  });
}
