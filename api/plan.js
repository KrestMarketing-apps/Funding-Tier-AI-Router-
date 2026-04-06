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

export default async function handler(req, res) {
  try {
    let dataUrl = req.query.dataUrl;
    const slug = req.query.slug;

    // TEMPORARY: uses your current public blob host
    // If your blob host changes later, update this one line.
    if (!dataUrl && slug) {
      dataUrl = `https://xcbefibugdiyl6le.public.blob.vercel-storage.com/plans/${slug}.json`;
    }

    if (!dataUrl) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(400).send('<h1>Missing plan data.</h1>');
    }

    const fetchRes = await fetch(dataUrl);

    if (!fetchRes.ok) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send('<h1>Plan data not found.</h1>');
    }

    const data = await fetchRes.json();

    const {
      firstName = 'Client',
      fullName = 'Client',
      email = '',
      state = '',
      totalDebt = 0,
      doNothing = {},
      shortest = {},
      recommended = {},
      route = '',
      routeReason = '',
      rows = [],
      savings = 0
    } = data;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
      border-radius: 22px;
      background: rgba(255,255,255,0.13);
      border: 1px solid rgba(255,255,255,0.14);
      padding: 22px;
      backdrop-filter: blur(10px);
    }
    .hero-card .label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: .08em;
      opacity: 0.9;
    }
    .hero-card .value {
      margin-top: 8px;
      font-size: 34px;
      font-weight: 800;
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
    .kpi .label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: .08em;
      color: #64748b;
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
      line-height: 1.7;
      color: #64748b;
    }
    @media (max-width: 900px) {
      .hero-grid, .kpi-grid, .debt-item {
        grid-template-columns: 1fr;
      }
      h1 {
        font-size: 34px;
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
            This webpage shows the difference between continuing your current financial path versus moving into a structured debt resolution program based on the current scenario inputs.
          </p>
          <div class="cta-wrap">
            <a class="btn btn-primary" href="https://krestmarketing.com/start-winning/">Schedule Your Next Step</a>
            <a class="btn btn-secondary" href="tel:8337163863">Call Funding Tier</a>
          </div>
        </div>
        <div class="hero-card">
          <div class="label">Estimated Savings vs Current Path</div>
          <div class="value">${currency(savings)}</div>
          <div style="margin-top:14px;font-size:14px;line-height:1.7;">
            Recommended route: <strong>${escapeHtml(route || 'N/A')}</strong><br/>
            State: <strong>${escapeHtml(state || 'N/A')}</strong><br/>
            Total debt reviewed: <strong>${currency(totalDebt)}</strong>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <h2>Your Estimated Snapshot</h2>
      <p class="lead">
        The numbers below are meant to show why staying on the current path can become more expensive over time, and how a structured program may create a more manageable outcome.
      </p>

      <div class="kpi-grid">
        <div class="kpi">
          <div class="label">Total Debt Reviewed</div>
          <div class="value">${currency(totalDebt)}</div>
        </div>
        <div class="kpi">
          <div class="label">Current Monthly Path</div>
          <div class="value">${currency(doNothing.monthlyPayment || 0)}</div>
        </div>
        <div class="kpi">
          <div class="label">Recommended Monthly</div>
          <div class="value">${currency(recommended.monthlyPayment || 0)}</div>
        </div>
        <div class="kpi">
          <div class="label">Recommended Term</div>
          <div class="value">${recommended.term ? `${recommended.term} mo` : '—'}</div>
        </div>
      </div>

      <div class="compare">
        <table>
          <thead>
            <tr>
              <th>Detail</th>
              <th>Current Financial Situation</th>
              <th>Fastest Available Payoff</th>
              <th class="best-col">Recommended Program</th>
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
              <td>${doNothing.monthsToPayoff || '—'} months</td>
              <td>${shortest.term || '—'} months</td>
              <td class="best-col">${recommended.term || '—'} months</td>
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

      <div class="footer-note">
        <strong>Why this matters:</strong> continuing to make minimum payments can stretch debt out for a long time and materially increase total payback. A structured program may provide a more controlled path with a lower total burden compared with the current financial situation.
      </div>
    </section>

    <section class="section">
      <h2>Accounts Reviewed</h2>
      <p class="lead">
        Below is the debt mix used to create this estimate.
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
        ${escapeHtml(routeReason || '')}
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
