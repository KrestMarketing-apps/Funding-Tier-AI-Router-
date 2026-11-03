import { get } from '@vercel/blob';
import {
  ESTIMATE_DISCLOSURE,
  CREDIT_RUNWAY_COPY,
  DO_NOTHING_COPY,
  REQUIRED_DISCLOSURES,
  MINIMUM_PAYMENT_NOTE,
  programContentFor
} from '../agents/prospect-program-content.js';

// Funding Tier phone line, as a tel: href and as display text.
const PHONE_TEL = 'tel:+18337163863';
const PHONE_TEXT = '(833) 716-3863';

// Where a prospect's "email me this plan" request goes.
const PLAN_COPY_EMAIL = 'success@fundingtier.com';

function currency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value || 0);
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function isNum(v) {
  return typeof v === 'number' && Number.isFinite(v);
}

// Months cell text. Never prints "— months".
function monthsText(value, neverPaysOff = false) {
  if (neverPaysOff) return 'Does not pay off at this payment';
  const n = Number(value);
  if (!value || !Number.isFinite(n) || n <= 0) return 'Not available';
  return `${Math.round(n)} months`;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const EXPIRED_HTML =
  '<h1>This plan link has expired.</h1>' +
  '<p>Please contact your Funding Tier representative for an updated copy.</p>';

const ERROR_HTML =
  '<h1>We could not load this plan.</h1>' +
  `<p>Please contact Funding Tier at <a href="${PHONE_TEL}">${PHONE_TEXT}</a>.</p>`;

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');

  try {
    // Lookup is by token only. The /plan/:name/ segment is cosmetic and is
    // never read here. There is no caller-supplied URL to fetch.
    const token = String(req.query.token || '').trim();

    if (!token) {
      return res.status(400).send('<h1>Missing plan data.</h1>');
    }

    // Legacy name-and-timestamp links are intentionally dead. Show the same
    // expiry page rather than a broken-looking error.
    if (!UUID_RE.test(token)) {
      return res.status(410).send(EXPIRED_HTML);
    }

    const result = await get(`plans/${token}.json`, { access: 'private' });

    if (!result || result.statusCode !== 200 || !result.stream) {
      return res.status(404).send('<h1>Plan data not found.</h1>');
    }

    const data = JSON.parse(await new Response(result.stream).text());

    if (data.expiresAt && Date.now() > Date.parse(data.expiresAt)) {
      return res.status(410).send(EXPIRED_HTML);
    }

    const {
      firstName = '',
      fullName = '',
      state = '',
      totalDebt = 0,
      doNothing = {},
      recommended = {},
      rows = [],
      savings = 0,
      savingsVsMinimumOnly = 0,
      program = null,
      minimumOnly = null,
      creditRunway = null
    } = data;

    // generate-plan.js defaults a missing name to 'Client'; treat that the
    // same as blank so the page never reads "Client, Here Is Your...".
    const safeFirst = escapeHtml(String(firstName || '').trim());
    const hasName = safeFirst && safeFirst.toLowerCase() !== 'client';
    const safeFull = escapeHtml(String(fullName || '').trim() || 'Your');
    const safeState = escapeHtml(String(state || '').trim() || 'N/A');

    const neverPaysOff = doNothing.neverPaysOff === true;
    const balanceAt36 = isNum(doNothing.balanceAt36) ? doNothing.balanceAt36 : null;
    const interestAt36 = isNum(doNothing.interestAt36) ? doNothing.interestAt36 : null;
    const aprPercent = Math.round((doNothing.apr || 0) * 100);

    const list = (items) => (Array.isArray(items) ? items : []).map((t) => escapeHtml(t));
    const programName = program && program.publicName ? program.publicName : 'Recommended Program';

    // Stored plans carry the program copy as it was at generation time; the
    // debtOutcome sentence is newer, so fall back to the live content module.
    const liveContent = program ? programContentFor(program.key) : null;
    const debtOutcome = (program && program.debtOutcome) || (liveContent && liveContent.debtOutcome) || '';

    const programSection = program
      ? `
    <section class="section program">
      <span class="pill">Your Recommended Program</span>
      <h2>${escapeHtml(programName)}</h2>
      <p class="lead">${escapeHtml(program.tagline || '')}</p>
      <div class="kpi-grid kpi-3">
        <div class="kpi kpi-green">
          <div class="label">${escapeHtml(program.paymentLabel || 'Monthly Program Payment')}</div>
          <div class="value">${currency(program.monthlyPayment || recommended.monthlyPayment || 0)}</div>
        </div>
        <div class="kpi kpi-green">
          <div class="label">Estimated Program Length</div>
          <div class="value">${escapeHtml(monthsText(program.term || recommended.term))}</div>
        </div>
        <div class="kpi kpi-green">
          <div class="label">Estimated Total Program Cost</div>
          <div class="value">${currency(program.totalCost || recommended.totalCost || 0)}</div>
        </div>
      </div>
      ${debtOutcome ? `<p class="outcome-note">${escapeHtml(debtOutcome)}</p>` : ''}
      <div class="two-col">
        <div class="card">
          <h3>How It Works</h3>
          <ol>${list(program.howItWorks).map((t) => `<li>${t}</li>`).join('')}</ol>
        </div>
        <div class="card">
          <h3>Key Benefits</h3>
          <ul class="checks">${list(program.benefits).map((t) => `<li>${t}</li>`).join('')}</ul>
        </div>
      </div>
      <div class="footer-note">${escapeHtml(program.disclosure || '')}</div>
    </section>`
      : '';

    const mo = minimumOnly || {};
    const cr = creditRunway;
    const marks = [3, 6, 12, 18, 24, 36];
    const maxTxt = (r) => (r && r.monthsToMaxOut ? `about ${r.monthsToMaxOut} months` : 'not within 50 years');
    const payTxt = cr ? `${currency(cr.monthlyPayment)}/mo${cr.paymentIsEstimate ? ' (estimated minimum)' : ''}` : '';
    const runwaySection = !cr ? '' : `
    <section class="section do-nothing">
      <h2>${escapeHtml(CREDIT_RUNWAY_COPY.heading)} <span class="est-tag">Estimated</span></h2>
      <p class="lead">${escapeHtml(CREDIT_RUNWAY_COPY.intro)}</p>
      <div class="kpi-grid">
        <div class="kpi"><div class="label">Open Card Balance</div><div class="value">${currency(cr.openBalance)}</div></div>
        <div class="kpi"><div class="label">Total Credit Limit</div><div class="value">${currency(cr.creditLimit)}</div></div>
        <div class="kpi"><div class="label">Available Credit Today</div><div class="value">${currency(cr.availableCredit)}</div></div>
        <div class="kpi kpi-warn"><div class="label">Interest Added Each Month</div><div class="value">~${currency(cr.monthlyInterest)}</div><div class="sub">at ${escapeHtml(String(cr.aprPercent))}% APR</div></div>
      </div>
      <div class="compare">
        <table>
          <thead><tr><th>Estimated Available Credit Left</th>${marks.map((m) => `<th>${m} mo</th>`).join('')}<th>Credit Maxed Out In</th></tr></thead>
          <tbody>
            <tr><td>At current payment: ${escapeHtml(payTxt)}</td>${marks.map((m) => `<td>${currency(cr.atCurrentPayment.availableAt[m])}</td>`).join('')}<td class="danger">${escapeHtml(maxTxt(cr.atCurrentPayment))}</td></tr>
            <tr><td>If payments stop</td>${marks.map((m) => `<td>${currency(cr.ifPaymentsStop.availableAt[m])}</td>`).join('')}<td class="danger">${escapeHtml(maxTxt(cr.ifPaymentsStop))}</td></tr>
          </tbody>
        </table>
      </div>
      <div class="explain-box warn">
        <div class="check-icon">!</div>
        <div>${cr.paymentCoversInterest
          ? `At ${escapeHtml(payTxt)}, about ${escapeHtml(String(cr.interestShareOfPayment))}% of each payment is estimated to go to interest — roughly ${currency(cr.atCurrentPayment.interestNext12)} over the next 12 months — so the balance comes down slowly. If a payment is missed, interest is still added and your estimated available credit could be used up in ${escapeHtml(maxTxt(cr.ifPaymentsStop))}.`
          : `At ${escapeHtml(payTxt)}, your estimated payment does not cover the ${currency(cr.monthlyInterest)} of interest added each month, so the balance grows and your available credit is estimated to run out in ${escapeHtml(maxTxt(cr.atCurrentPayment))}.`}</div>
      </div>
      <div class="footer-note">${escapeHtml(CREDIT_RUNWAY_COPY.disclosure)}</div>
    </section>`;

    // Hero figure: savings normally; the 36-month balance when the current
    // payment never pays the debt off (a savings number would be meaningless).
    const heroFigure = neverPaysOff
      ? `<div class="label">Balance After 36 Months At Your Current Payment</div>
          <div class="value">${balanceAt36 !== null ? currency(balanceAt36) : 'Not available'}</div>
          <div class="subcopy">Estimate. At your current payment the balance does not pay off.</div>`
      : `<div class="label">Estimated Savings vs Current Path</div>
          <div class="value">${currency(savings)}</div>`;

    const currentPathSavingsCell = neverPaysOff
      ? `<div class="label">Balance After 36 Months At Your Current Payment</div><div class="value">${balanceAt36 !== null ? currency(balanceAt36) : 'Not available'}</div><div class="sub">at ${currency(doNothing.monthlyPayment || 0)}/mo the balance keeps growing (estimate)</div>`
      : `<div class="label">Estimated Savings vs Your Current Payment</div><div class="value">${currency(savings)}</div><div class="sub">vs paying ${currency(doNothing.monthlyPayment || 0)}/mo until paid off (${currency(doNothing.totalPayback || 0)} total)</div>`;

    // Plans generated before this section existed carry no minimumOnly data.
    const doNothingSection = !minimumOnly ? '' : `
    <section class="section do-nothing">
      <h2>${escapeHtml(DO_NOTHING_COPY.heading)} <span class="est-tag">Estimated</span></h2>
      <p class="lead">${escapeHtml(DO_NOTHING_COPY.intro)}</p>
      <div class="kpi-grid">
        ${mo.dailyInterest ? `<div class="kpi kpi-warn"><div class="label">Interest Charged Every Day</div><div class="value">~$${Number(mo.dailyInterest).toFixed(2)}</div></div>` : ''}
        ${mo.monthlyInterest ? `<div class="kpi kpi-warn"><div class="label">Interest Per Month</div><div class="value">~${currency(mo.monthlyInterest)}</div></div>` : ''}
        <div class="kpi kpi-warn"><div class="label">Paying Minimums Only</div><div class="value">${escapeHtml(mo.yearsMonths || doNothing.minimumOnlyYearsMonths || 'Not available')}</div><div class="sub">to pay it off</div></div>
        <div class="kpi kpi-warn"><div class="label">Interest Paid On Minimums</div><div class="value">${currency(mo.interestCost || 0)}</div><div class="sub">total paid ${currency(mo.totalPayback || 0)}</div></div>
      </div>
      <div class="savings-strip">
        <div>${currentPathSavingsCell}</div>
        <div><div class="label">Estimated Savings vs Minimum Payments Only</div><div class="value">${currency(savingsVsMinimumOnly)}</div><div class="sub">vs ${currency(mo.totalPayback || 0)} total on minimum payments</div></div>
      </div>
      ${Number(mo.totalPayback) > 0 ? `<div class="footer-note"><strong>Minimum payment note:</strong> ${escapeHtml(MINIMUM_PAYMENT_NOTE)}</div>` : ''}
      <div class="footer-note">${escapeHtml(DO_NOTHING_COPY.disclosure)}</div>
    </section>`;

    const next36Section = interestAt36 === null ? '' : `
    <section class="section do-nothing">
      <h2>Over The Next 36 Months <span class="est-tag">Estimated</span></h2>
      <p class="lead">A like-for-like look at the same 36-month window on your current path and in the program.</p>
      <div class="kpi-grid kpi-3">
        <div class="kpi kpi-warn"><div class="label">Interest You Would Pay On The Current Path</div><div class="value">${currency(interestAt36)}</div><div class="sub">over 36 months (estimate)</div></div>
        <div class="kpi kpi-warn"><div class="label">Balance Still Owed After 36 Months</div><div class="value">${balanceAt36 !== null ? currency(balanceAt36) : 'Not available'}</div><div class="sub">on the current path (estimate)</div></div>
        <div class="kpi kpi-green"><div class="label">Program Cost Over The Same Period</div><div class="value">${currency(recommended.totalCost || 0)}</div><div class="sub">estimated total program cost</div></div>
      </div>
      <div class="footer-note">${escapeHtml(DO_NOTHING_COPY.disclosure)}</div>
    </section>`;

    const userFriendlyEstimateNote =
      'These estimated program details are based on projected settlement assumptions, program fees, and the creditor accounts that were selected to be included in this review. Final terms may vary after full review.';

    const h1 = hasName
      ? `${safeFirst}, Here Is Your Debt Resolution Comparison`
      : 'Your Debt Resolution Comparison';

    const mailtoHref = `mailto:${PLAN_COPY_EMAIL}?subject=${encodeURIComponent(`Plan copy request ${token}`)}`;

    const programSavingsCell = neverPaysOff
      ? (interestAt36 !== null ? 'See the 36-month comparison below' : 'Not available')
      : currency(savings);

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <meta name="theme-color" content="#0f9b8e" />
  <title>${safeFull} - Debt Resolution Plan</title>
  <style>
    body {
      margin: 0;
      font-family: Arial, Helvetica, sans-serif;
      background: linear-gradient(180deg, #ecfeff 0%, #ffffff 35%, #f8fafc 100%);
      color: #0f172a;
    }
    .wrap {
      max-width: 1180px;
      margin: 0 auto;
      padding: 24px;
    }
    .hero {
      border-radius: 28px;
      background: linear-gradient(135deg, #0f766e 0%, #0d9488 35%, #14b8a6 100%);
      color: white;
      padding: 42px 34px;
      box-shadow: 0 20px 50px rgba(15, 118, 110, 0.22);
    }
    .hero-grid {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 24px;
      align-items: center;
    }
    .eyebrow {
      display: inline-block;
      padding: 8px 14px;
      border-radius: 999px;
      background: rgba(255,255,255,0.14);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: .04em;
    }
    h1 {
      margin: 18px 0 10px;
      font-size: 42px;
      line-height: 1.05;
      letter-spacing: -0.03em;
    }
    .hero p {
      margin: 0;
      font-size: 17px;
      line-height: 1.7;
      color: rgba(255,255,255,0.94);
    }
    .hero-card {
      border-radius: 24px;
      background: linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.10) 100%);
      border: 1px solid rgba(255,255,255,0.18);
      padding: 24px;
      backdrop-filter: blur(10px);
      box-shadow: 0 18px 40px rgba(0,0,0,0.10);
    }
    .hero-card .label {
      font-size: 12px;
      letter-spacing: .04em;
      opacity: 0.96;
      font-weight: 800;
    }
    .hero-card .value {
      margin-top: 10px;
      font-size: 42px;
      font-weight: 900;
      line-height: 1;
      color: #ffffff;
      text-shadow: 0 2px 14px rgba(0,0,0,0.14);
    }
    .hero-card .subcopy {
      margin-top: 14px;
      font-size: 14px;
      line-height: 1.7;
      color: rgba(255,255,255,0.95);
    }
    .section {
      margin-top: 28px;
      border-radius: 24px;
      background: white;
      padding: 28px;
      box-shadow: 0 12px 36px rgba(15, 23, 42, 0.07);
    }
    .section h2 {
      margin: 0 0 10px;
      font-size: 28px;
      letter-spacing: -0.02em;
    }
    .section p.lead {
      margin: 0;
      color: #475569;
      line-height: 1.7;
    }
    .kpi-grid {
      margin-top: 24px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 18px;
    }
    .kpi {
      border-radius: 20px;
      background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
      border: 1px solid #e2e8f0;
      padding: 18px;
    }
    .kpi-red {
      background: linear-gradient(180deg, #dc2626 0%, #991b1b 100%);
      border: 1px solid #991b1b;
      color: white;
      box-shadow: 0 10px 25px rgba(220,38,38,0.35);
    }
    .kpi-red::after {
      content: "Current Path";
      display: block;
      margin-top: 10px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: .04em;
      color: rgba(255,255,255,0.9);
    }
    .kpi-red .label,
    .kpi-red .value,
    .kpi-red .sub,
    .kpi.kpi-red .label,
    .kpi.kpi-red .sub {
      color: #ffffff !important;
    }
    .kpi-red .sub {
      opacity: .92;
    }
    .kpi-green {
      background: linear-gradient(180deg, #ecfdf5 0%, #d1fae5 100%);
      border: 1px solid #99f6e4;
    }
    .kpi-green .label,
    .kpi-green .value {
      color: #0f766e;
    }
    .kpi-green .sub {
      color: #065f46;
    }
    .kpi .label {
      font-size: 12px;
      letter-spacing: .04em;
      color: #64748b;
      font-weight: 700;
    }
    .kpi .value {
      margin-top: 8px;
      font-size: 28px;
      font-weight: 800;
    }
    .outcome-note {
      margin: 18px 0 0;
      padding: 14px 16px;
      border-radius: 14px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      color: #334155;
      font-size: 14px;
      line-height: 1.7;
    }
    .compare {
      margin-top: 24px;
      overflow-x: auto;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      min-width: 720px;
    }
    th, td {
      padding: 16px;
      border-bottom: 1px solid #e2e8f0;
      text-align: left;
      vertical-align: top;
    }
    th {
      background: #f8fafc;
      font-size: 13px;
      letter-spacing: .03em;
      color: #334155;
    }
    .best-col {
      background: #ecfdf5;
    }
    .danger {
      color: #dc2626;
      font-weight: 800;
    }
    .success {
      color: #0f766e;
      font-weight: 800;
    }
    .cta-wrap {
      margin-top: 28px;
      display: flex;
      gap: 14px;
      flex-wrap: wrap;
    }
    .btn {
      display: inline-block;
      padding: 14px 22px;
      border-radius: 14px;
      text-decoration: none;
      font-weight: 700;
    }
    .btn-primary {
      background: linear-gradient(90deg, #0f766e, #14b8a6);
      color: white;
    }
    .btn-secondary {
      background: white;
      color: #0f766e;
      border: 1px solid #99f6e4;
    }
    .explain-box {
      margin-top: 18px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px 18px;
      border: 1px solid #a7f3d0;
      background: #ecfdf5;
      border-radius: 18px;
    }
    .check-icon {
      width: 28px;
      height: 28px;
      border-radius: 999px;
      background: #10b981;
      color: white;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      flex: 0 0 auto;
      margin-top: 2px;
    }
    .debt-list {
      margin-top: 22px;
      display: grid;
      gap: 12px;
    }
    .debt-item {
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      background: #ffffff;
      padding: 16px;
      display: grid;
      grid-template-columns: 1.2fr .6fr .8fr;
      gap: 14px;
    }
    .footer-note {
      margin-top: 18px;
      font-size: 13px;
      line-height: 1.8;
      color: #64748b;
    }
    .disclosures ul {
      margin: 16px 0 0;
      padding-left: 20px;
      color: #475569;
      font-size: 14px;
      line-height: 1.8;
    }
    .disclosures li { margin-bottom: 4px; }
    .est-banner { margin:18px 0 0; padding:12px 16px; border-radius:14px; background:#fffbeb; border:1px solid #fcd34d; color:#92400e; font-size:13px; line-height:1.6; }
    .est-tag { font-size:11px; font-weight:800; letter-spacing:.04em; color:#92400e; background:#fef3c7; border-radius:999px; padding:3px 9px; vertical-align:middle; }
    .explain-box.warn { background:#fef2f2; border-color:#fecaca; }
    .explain-box.warn .check-icon { background:#dc2626; }
    .pill { display:inline-block; padding:6px 12px; border-radius:999px; background:#ccfbf1; color:#0f766e; font-size:11px; font-weight:800; letter-spacing:.04em; }
    .program h2 { margin-top:12px; }
    .kpi-grid.kpi-3 { grid-template-columns: repeat(3, 1fr); }
    .two-col { display:grid; grid-template-columns:1fr 1fr; gap:18px; margin-top:22px; }
    .card { border:1px solid #ccfbf1; background:#f0fdfa; border-radius:18px; padding:20px 22px; }
    .card h3 { margin:0 0 10px; font-size:17px; color:#0f766e; }
    .card ol, .card ul { margin:0; padding-left:20px; line-height:1.7; font-size:15px; }
    .card li { margin-bottom:6px; }
    ul.checks { list-style:none; padding-left:0; }
    ul.checks li { padding-left:26px; position:relative; }
    ul.checks li::before { content:'✓'; position:absolute; left:0; top:0; color:#0f766e; font-weight:900; }
    .kpi-warn { background:#fef2f2; border:1px solid #fecaca; }
    .kpi-warn .label { color:#991b1b; }
    .kpi-warn .value { color:#b91c1c; }
    .kpi .sub { margin-top:6px; font-size:12px; font-weight:600; color:#64748b; }
    .savings-strip { display:grid; grid-template-columns:1fr 1fr; gap:18px; margin-top:20px; padding:20px 22px; border-radius:18px; background:linear-gradient(135deg,#0f766e,#14b8a6); color:#fff; }
    .savings-strip .label { font-size:12px; font-weight:800; letter-spacing:.04em; opacity:.85; }
    .savings-strip .value { font-size:32px; font-weight:900; margin-top:6px; }
    .savings-strip .sub { font-size:13px; opacity:.9; margin-top:4px; }
    @media (max-width: 900px) {
      .kpi-grid.kpi-3, .two-col, .savings-strip { grid-template-columns: 1fr; }
      .hero-grid, .kpi-grid, .debt-item {
        grid-template-columns: 1fr;
      }
      h1 {
        font-size: 34px;
      }
      .hero-card .value {
        font-size: 36px;
      }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <section class="hero">
      <div class="hero-grid">
        <div>
          <span class="eyebrow">Funding Tier Personalized Estimate</span>
          <h1>${h1}</h1>
          <p>
            This page is designed to help you clearly understand how your current debt path compares to a potential new structured resolution program, including the estimated monthly payment difference and estimated total cost.
          </p>
          <div class="cta-wrap">
            <a class="btn btn-primary" href="${PHONE_TEL}">Call Funding Tier ${PHONE_TEXT}</a>
          </div>
        </div>
        <div class="hero-card">
          ${heroFigure}
          <div class="subcopy">
            State: <strong>${safeState}</strong><br/>
            Total debt reviewed: <strong>${currency(totalDebt)}</strong>
          </div>
        </div>
      </div>
    </section>

    <div class="est-banner"><strong>Estimates only.</strong> ${escapeHtml(ESTIMATE_DISCLOSURE)}</div>

    ${programSection}

    <section class="section">
      <h2>Your Estimated Snapshot</h2>
      <p class="lead">
        Below is a simple estimate showing how your current path compares to a potential new structured program option.
      </p>

      <div class="kpi-grid">
        <div class="kpi">
          <div class="label">Total Debt Reviewed</div>
          <div class="value">${currency(totalDebt)}</div>
        </div>
        <div class="kpi kpi-red">
          <div class="label">Your Current Monthly Payment</div>
          <div class="value">${currency(doNothing.monthlyPayment || 0)}</div>
          <div class="sub">Based on the payment amount you shared with us (estimate)</div>
        </div>
        <div class="kpi kpi-green">
          <div class="label">Estimated Program Payment</div>
          <div class="value">${currency(recommended.monthlyPayment || 0)}</div>
          <div class="sub">Your estimated monthly program amount</div>
        </div>
        <div class="kpi kpi-green">
          <div class="label">Estimated Program Length</div>
          <div class="value">${escapeHtml(monthsText(recommended.term))}</div>
        </div>
      </div>

      <div class="compare">
        <table>
          <thead>
            <tr>
              <th>Detail</th>
              <th>Current Path</th>
              <th class="best-col">${escapeHtml(programName)}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Monthly Payment</td>
              <td>${currency(doNothing.monthlyPayment || 0)}</td>
              <td class="best-col">${currency(recommended.monthlyPayment || 0)}</td>
            </tr>
            <tr>
              <td>Total Estimated Debt</td>
              <td>${currency(totalDebt)}</td>
              <td class="best-col">Estimated Program Cost: ${currency(recommended.totalCost || 0)}</td>
            </tr>
            <tr>
              <td>Months To Payoff</td>
              <td>${escapeHtml(monthsText(doNothing.monthsToPayoff, neverPaysOff))}</td>
              <td class="best-col">${escapeHtml(monthsText(recommended.term))}</td>
            </tr>
            <tr>
              <td>Interest On Program Payments</td>
              <td>${aprPercent}% APR</td>
              <td class="best-col">None charged by the program</td>
            </tr>
            <tr>
              <td>Estimated Total Paid</td>
              <td class="danger">${neverPaysOff ? 'Balance keeps growing' : currency(doNothing.totalPayback || 0)}</td>
              <td class="best-col">${currency(recommended.totalCost || 0)}</td>
            </tr>
            <tr>
              <td>Estimated Savings</td>
              <td>—</td>
              <td class="best-col success">${escapeHtml(programSavingsCell)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="explain-box">
        <div class="check-icon">✓</div>
        <div>
          <strong>Why this matters:</strong> continuing to make minimum payments can stretch debt out for a long time and materially increase the total you pay. A structured program may provide a more controlled path with a lower estimated total cost compared with your current path.
        </div>
      </div>
    </section>

    ${next36Section}

    ${doNothingSection}

    ${runwaySection}

    <section class="section">
      <h2>Accounts Reviewed</h2>
      <p class="lead">
        Below are the accounts and debt entries used to prepare this estimate.
      </p>

      <div class="debt-list">
        ${(rows || []).map((row) => `
          <div class="debt-item">
            <div>
              <strong>${escapeHtml(row.creditorName === 'Other / Manual Entry' ? (row.manualName || 'Manual Creditor') : (row.creditorName || 'Unknown Creditor'))}</strong>
            </div>
            <div>${currency(row.amount || 0)}</div>
            <div>${escapeHtml(row.debtType || 'Not specified')}</div>
          </div>
        `).join('')}
      </div>

      <div class="footer-note">
        ${escapeHtml(userFriendlyEstimateNote)}
      </div>
    </section>

    <section class="section">
      <h2>Next Step</h2>
      <p class="lead">
        If this estimated path makes sense to you, your Funding Tier specialist will complete your review so your final program structure can be confirmed. Need to pick this back up later? Call us and we will schedule a callback.
      </p>

      <div class="cta-wrap">
        <a class="btn btn-primary" href="${PHONE_TEL}">Call Funding Tier ${PHONE_TEXT}</a>
        <a class="btn btn-secondary" href="${escapeHtml(mailtoHref)}">Email Me This Plan</a>
      </div>

      <div class="footer-note">
        These estimates are illustrative only and final terms may vary based on a full review of the account profile and the debts elected to be included.
      </div>
    </section>

    <section class="section disclosures">
      <h2>Important Disclosures</h2>
      <ul>
        ${REQUIRED_DISCLOSURES.map((d) => `<li>${escapeHtml(d)}</li>`).join('')}
      </ul>
      <div class="footer-note">${escapeHtml(ESTIMATE_DISCLOSURE)}</div>
    </section>
  </div>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch (err) {
    console.error('plan.js failed to render plan:', err);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(500).send(ERROR_HTML);
  }
}
