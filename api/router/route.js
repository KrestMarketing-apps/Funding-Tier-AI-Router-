import { put } from '@vercel/blob';

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
        debtType: 'Unsecured Debt',
      });
    }
  }

  return rows;
}

function recommendedPaymentByDebt(totalDebt) {
  if (totalDebt < 4000) return 220;
  if (totalDebt < 8800) return 220;
  if (totalDebt < 15000) return 270;
  if (totalDebt < 20000) return 320;
  if (totalDebt < 25000) return 370;
  if (totalDebt < 30000) return 420;
  if (totalDebt < 50000) return 520;
  return 620;
}

function recommendedTermByDebt(totalDebt) {
  if (totalDebt < 5000) return 18;
  if (totalDebt < 8800) return 24;
  return 36;
}

function buildPlanData({ firstName, lastName, email, state, rows }) {
  const totalDebt = round(rows.reduce((sum, row) => sum + toNumber(row.amount), 0));

  const currentApr = 0.29;
  const currentMonthly = Math.max(225, round(totalDebt * 0.03));
  const monthlyInterest = totalDebt * (currentApr / 12);

  let monthsToPayoff = 0;
  if (currentMonthly > monthlyInterest && totalDebt > 0) {
    monthsToPayoff = Math.ceil(
      -Math.log(1 - (totalDebt * (currentApr / 12)) / currentMonthly) /
        Math.log(1 + currentApr / 12)
    );
  } else if (totalDebt > 0) {
    monthsToPayoff = 120;
  }

  const currentTotalPayback =
    totalDebt > 0 ? round(currentMonthly * Math.max(monthsToPayoff, 1)) : 0;

  const shortestTerm = Math.max(12, Math.min(24, Math.ceil(totalDebt / 1000)));
  const shortestMonthly =
    shortestTerm > 0 ? round(totalDebt / shortestTerm) : 0;
  const shortestTotal = round(shortestMonthly * shortestTerm);

  const recommendedTerm = recommendedTermByDebt(totalDebt);
  const recommendedMonthly = recommendedPaymentByDebt(totalDebt);
  const recommendedTotal = round(recommendedMonthly * recommendedTerm);

  const savings = Math.max(0, currentTotalPayback - recommendedTotal);

  return {
    firstName: firstName || 'Client',
    fullName: [firstName, lastName].filter(Boolean).join(' ') || 'Client',
    email: email || '',
    state: state || '',
    totalDebt,
    doNothing: {
      monthlyPayment: currentMonthly,
      monthsToPayoff,
      apr: currentApr,
      totalPayback: currentTotalPayback,
    },
    shortest: {
      monthlyPayment: shortestMonthly,
      term: shortestTerm,
      totalCost: shortestTotal,
    },
    recommended: {
      monthlyPayment: recommendedMonthly,
      term: recommendedTerm,
      totalCost: recommendedTotal,
    },
    routeReason:
      'Plan created from router webhook and stored to Blob for plan page rendering.',
    rows,
    savings,
  };
}

export async function POST(req) {
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
    const planData = buildPlanData({
      firstName,
      lastName,
      email,
      state,
      rows,
    });

    const timestamp = Date.now();
    const slug = `${slugify(`${firstName} ${lastName} debt resolution plan`)}-${timestamp}`;
    const planId = slug;

    const blob = await put(
      `plans/${slug}.json`,
      JSON.stringify(planData, null, 2),
      {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'application/json',
      }
    );

const baseUrl = 'https://ai.fundingtier.com';
const planUrl = `${baseUrl}/plan/${slug}`;
const pdfUrl = `${baseUrl}/api/generate-pdf?dataUrl=${encodeURIComponent(blob.url)}`;
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
          key: 'debt_resolution_pdf_url',
          field_value: pdfUrl,
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
      blob: {
        url: blob.url,
        pathname: blob.pathname,
      },
      writtenFields: {
        debt_resolution_plan_last_generated_timestamp: generatedAt,
        debt_resolution_plan_id: planId,
        debt_resolution_pdf_url: pdfUrl,
        debt_resolution_plan_url: planUrl,
      },
      ghlResponse: ghlUpdate.text,
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
