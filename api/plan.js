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
    const dataUrl = req.query.dataUrl;

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
  margin:0;
  font-family: Arial, Helvetica, sans-serif;
  background: linear-gradient(180deg,#ecfeff,#ffffff,#f8fafc);
  color:#0f172a;
}
.wrap {
  max-width:1100px;
  margin:0 auto;
  padding:24px;
}
.hero {
  background: linear-gradient(135deg,#0f766e,#14b8a6);
  color:white;
  border-radius:20px;
  padding:30px;
}
h1 {
  font-size:34px;
  margin:0 0 10px;
}
.section {
  margin-top:24px;
  background:white;
  padding:24px;
  border-radius:20px;
  box-shadow:0 10px 30px rgba(0,0,0,0.05);
}
.kpi-grid {
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:12px;
  margin-top:20px;
}
.kpi {
  border:1px solid #e2e8f0;
  border-radius:12px;
  padding:12px;
}
.value {
  font-size:24px;
  font-weight:bold;
}
table {
  width:100%;
  margin-top:20px;
  border-collapse:collapse;
}
td,th {
  padding:12px;
  border-bottom:1px solid #e2e8f0;
}
.best {
  background:#ecfdf5;
}
</style>
</head>

<body>

<div class="wrap">

<div class="hero">
<h1>${escapeHtml(firstName)}, here’s your AI generated debt resolution plan</h1>
<p>Compare your current financial path vs a structured program.</p>
</div>

<div class="section">
<h2>Overview</h2>

<div class="kpi-grid">
<div class="kpi">
<div>Total Debt</div>
<div class="value">${currency(totalDebt)}</div>
</div>

<div class="kpi">
<div>Current Monthly</div>
<div class="value">${currency(doNothing.monthlyPayment || 0)}</div>
</div>

<div class="kpi">
<div>Recommended Monthly</div>
<div class="value">${currency(recommended.monthlyPayment || 0)}</div>
</div>
</div>

<table>
<tr>
<th></th>
<th>Current</th>
<th>Recommended</th>
</tr>

<tr>
<td>Monthly</td>
<td>${currency(doNothing.monthlyPayment || 0)}</td>
<td class="best">${currency(recommended.monthlyPayment || 0)}</td>
</tr>

<tr>
<td>Total Payback</td>
<td>${currency(doNothing.totalPayback || 0)}</td>
<td class="best">${currency(recommended.totalCost || 0)}</td>
</tr>

<tr>
<td>Savings</td>
<td>-</td>
<td class="best">${currency(savings)}</td>
</tr>

</table>

</div>

<div class="section">
<h2>Accounts</h2>

${rows.map(r => `
<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #eee;">
<div>${escapeHtml(r.creditorName || '')}</div>
<div>${currency(r.amount)}</div>
<div>${escapeHtml(r.debtType)}</div>
</div>
`).join('')}

</div>

</div>

</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);

  } catch (err) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(500).send(`<h1>Error loading plan</h1><pre>${escapeHtml(err.message)}</pre>`);
  }
}
