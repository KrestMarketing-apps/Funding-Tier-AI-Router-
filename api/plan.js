import { get } from '@vercel/blob';

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

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const EXPIRED_HTML =
  '<h1>This plan link has expired.</h1>' +
  '<p>Please contact your Funding Tier representative for an updated copy.</p>';

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
      firstName = 'Client',
      fullName = 'Client',
      email = '',
      state = '',
      totalDebt = 0,
      doNothing = {},
      shortest = {},
      recommended = {},
      routeReason = '',
      rows = [],
      savings = 0,
      savingsVsMinimumOnly = 0,
      program = null,
      minimumOnly = null
    } = data;

    const list = (items) => (Array.isArray(items) ? items : []).map((t) => escapeHtml(t));
    const programName = program && program.publicName ? program.publicName : 'Recommended Program';

    const programSection = program
      ? `
    <section class="section program">
      <span class="pill">Your recommended program</span>
      <h2>${escapeHtml(programName)}</h2>
      <p class="lead">${escapeHtml(program.tagline || '')}</p>
      <div class="kpi-grid kpi-3">
        <div class="kpi kpi-green">
          <div class="label">${escapeHtml(program.paymentLabel || 'Monthly program payment')}</div>
          <div class="value">${currency(program.monthlyPayment || recommended.monthlyPayment || 0)}</div>
        </div>
        <div class="kpi kpi-green">
          <div class="label">Program length</div>
          <div class="value">${escapeHtml(String(program.term || recommended.term || '—'))} months</div>
        </div>
        <div class="kpi kpi-green">
          <div class="label">Total program price</div>
          <div class="value">${currency(program.totalCost || recommended.totalCost || 0)}</div>
        </div>
      </div>
      <div class="two-col">
        <div class="card">
          <h3>How it gets you out of debt</h3>
          <ol>${list(program.howItWorks).map((t) => `<li>${t}</li>`).join('')}</ol>
        </div>
        <div class="card">
          <h3>Key benefits</h3>
          <ul class="checks">${list(program.benefits).map((t) => `<li>${t}</li>`).join('')}</ul>
        </div>
      </div>
      <div class="footer-note">${escapeHtml(program.disclosure || '')}</div>
    </section>`
      : '';

    const mo = minimumOnly || {};
    // Plans generated before this section existed carry no minimumOnly data.
    const doNothingSection = !minimumOnly ? '' : `
    <section class="section do-nothing">
      <h2>The cost of doing nothing</h2>
      <p class="lead">
        Credit card and loan interest compounds — you are charged interest on top of interest every month. Minimum payments are designed to keep you paying for years, and most of each payment goes to interest instead of your balance.
      </p>
      <div class="kpi-grid">
        ${mo.dailyInterest ? `<div class="kpi kpi-warn"><div class="label">Interest charged every day</div><div class="value">~$${Number(mo.dailyInterest).toFixed(2)}</div></div>` : ''}
        ${mo.monthlyInterest ? `<div class="kpi kpi-warn"><div class="label">Interest per month</div><div class="value">~${currency(mo.monthlyInterest)}</div></div>` : ''}
        <div class="kpi kpi-warn"><div class="label">Paying minimums only</div><div class="value">${escapeHtml(mo.yearsMonths || (doNothing.minimumOnlyYearsMonths || '—'))}</div><div class="sub">to pay it off</div></div>
        <div class="kpi kpi-warn"><div class="label">Interest paid on minimums</div><div class="value">${currency(mo.interestCost || 0)}</div><div class="sub">total paid ${currency(mo.totalPayback || 0)}</div></div>
      </div>
      <div class="savings-strip">
        <div><div class="label">Estimated savings vs your current payment</div><div class="value">${currency(savings)}</div><div class="sub">vs paying ${currency(doNothing.monthlyPayment || 0)}/mo until paid off (${currency(doNothing.totalPayback || 0)} total)</div></div>
        <div><div class="label">Estimated savings vs minimum payments only</div><div class="value">${currency(savingsVsMinimumOnly)}</div><div class="sub">vs ${currency(mo.totalPayback || 0)} total on minimum payments</div></div>
      </div>
      <div class="footer-note">Current-path figures are estimates that assume no new purchases, no late payments, no added fees, no penalty APR and no APR changes. Collection agencies may add their own interest or fees.</div>
    </section>`;

    const userFriendlyEstimateNote =
      'These estimated program details are based on projected settlement assumptions, program fees, and the creditor accounts that were selected to be included in this review. Final terms may vary after full review.';

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
  <title>${escapeHtml(fullName)} - Debt Resolution Plan</title>
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
      letter-spacing: .08em;
      text-transform: uppercase;
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
      text-transform: uppercase;
      letter-spacing: .10em;
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
  content: "⚠ CURRENT PATH";
  display: block;
  margin-top: 10px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .08em;
  color: rgba(255,255,255,0.9);
}

    .kpi-red .label {
  color: #000000;
}

.kpi-red .value {
  color: #ffffff;
}
    }
    .kpi-green {
      background: linear-gradient(180deg, #ecfdf5 0%, #d1fae5 100%);
      border: 1px solid #99f6e4;
    }
    .kpi-green .label,
    .kpi-green .value {
      color: #0f766e;
    }
    .kpi .label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: .08em;
      color: #64748b;
      font-weight: 700;
    }
    .kpi .value {
      margin-top: 8px;
      font-size: 28px;
      font-weight: 800;
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
      min-width: 900px;
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
      text-transform: uppercase;
      letter-spacing: .06em;
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
    .pill { display:inline-block; padding:6px 12px; border-radius:999px; background:#ccfbf1; color:#0f766e; font-size:11px; font-weight:800; letter-spacing:.06em; text-transform:uppercase; }
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
    .savings-strip .label { font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:.06em; opacity:.85; }
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
          <span class="eyebrow">Funding Tier AI Generated Debt Resolution Plan</span>
          <h1>${escapeHtml(firstName)}, here’s your debt resolution comparison</h1>
          <p>
            This page is designed to help you clearly understand how your current debt path compares to a potential new structured resolution program, including the estimated monthly payment difference and total projected savings.
          </p>
          <div class="cta-wrap">
            <a class="btn btn-primary" href="https://link.krestmarketing.com/widget/booking/vdZtTXpZHCstjMBql4a5" target="_blank" rel="noopener noreferrer">Schedule Your Next Step</a>
            <a class="btn btn-secondary" href="tel:8337163863">Call Funding Tier</a>
          </div>
        </div>
        <div class="hero-card">
          <div class="label">Estimated Savings vs Current Path</div>
          <div class="value">${currency(savings)}</div>
          <div class="subcopy">
            State: <strong>${escapeHtml(state || 'N/A')}</strong><br/>
            Total debt reviewed: <strong>${currency(totalDebt)}</strong>
          </div>
        </div>
      </div>
    </section>

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
<div class="label" style="color: #fff; font-weight: bold; text-decoration: underline;">
  Your Current Minimum Monthly Payment
</div>  <div class="value">${currency(doNothing.monthlyPayment || 0)}</div>

  <div style="
    margin-top:8px;
    font-size:13px;
    font-weight:600;
    color:#000;
  ">
    This is what you are currently stuck paying every month
  </div>
</div>
        <div class="kpi kpi-green">
          <div class="label">New Lower Monthly Payment</div>
          <div class="value">${currency(recommended.monthlyPayment || 0)}</div>
          <div style="
  margin-top:8px;
  font-size:13px;
  font-weight:600;
  color:#065f46;
">
  This is your new projected lower payment
</div>
        </div>
        <div class="kpi kpi-green">
          <div class="label">New Program Plan Length</div>
          <div class="value">${recommended.term ? `${escapeHtml(recommended.term)} mo` : '—'}</div>
        </div>
      </div>

      <div class="compare">
        <table>
          <thead>
            <tr>
              <th>Detail</th>
              <th>Current Financial Situation</th>
              <th>Fastest Available Payoff</th>
              <th class="best-col">${escapeHtml(programName)}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Monthly Payments</td>
              <td>${currency(doNothing.monthlyPayment || 0)}</td>
              <td>${currency(shortest.monthlyPayment || 0)}</td>
              <td class="best-col">${currency(recommended.monthlyPayment || 0)}</td>
            </tr>
            <tr>
              <td>Total Estimated Debt</td>
              <td>${currency(totalDebt)}</td>
              <td>${currency(totalDebt)}</td>
              <td class="best-col">${currency(totalDebt)}</td>
            </tr>
            <tr>
              <td>Months to Payoff</td>
              <td>${escapeHtml(doNothing.monthsToPayoff || '—')} months</td>
              <td>${escapeHtml(shortest.term || '—')} months</td>
              <td class="best-col">${escapeHtml(recommended.term || '—')} months</td>
            </tr>
            <tr>
              <td>Estimated Interest Rate</td>
              <td>${Math.round((doNothing.apr || 0) * 100)}% APR</td>
              <td>0%</td>
              <td class="best-col">0%</td>
            </tr>
            <tr>
              <td>Estimated Total Payback</td>
              <td class="danger">${currency(doNothing.totalPayback || 0)}</td>
              <td>${currency(shortest.totalCost || 0)}</td>
              <td class="best-col">${currency(recommended.totalCost || 0)}</td>
            </tr>
            <tr>
              <td>Estimated Savings</td>
              <td>—</td>
              <td class="success">${currency(Math.max(0, (doNothing.totalPayback || 0) - (shortest.totalCost || 0)))}</td>
              <td class="best-col success">${currency(savings)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="explain-box">
        <div class="check-icon">✓</div>
        <div>
          <strong>Why this matters:</strong> continuing to make minimum payments can stretch debt out for a long time and materially increase total payback. A structured program may provide a more controlled path with a lower total burden compared with your current financial situation.
        </div>
      </div>
    </section>

    ${doNothingSection}

    <section class="section">
      <h2>UNSECURED DEBTS / ACCOUNTS</h2>
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
            <div>${escapeHtml(row.debtType || '—')}</div>
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
        If this estimated path makes sense to you, the next step is to complete your review so your final program structure can be confirmed.
      </p>

      <div class="cta-wrap">
        <a class="btn btn-primary" href="https://link.krestmarketing.com/widget/booking/vdZtTXpZHCstjMBql4a5" target="_blank" rel="noopener noreferrer">Schedule Your Next Step</a>
        <a class="btn btn-secondary" href="mailto:${escapeHtml(email)}">Email Copy Requested</a>
      </div>

      <div class="footer-note">
        These estimates are illustrative only and final terms may vary based on a full review of the account profile and the debts elected to be included.
      </div>
    </section>
  </div>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch (err) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(500).send(`<h1>Error loading plan</h1><pre>${escapeHtml(err.message || 'Server error')}</pre>`);
  }
}
