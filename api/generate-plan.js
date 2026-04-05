import { put } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false });
  }

  try {
    const data = req.body;

    const {
      firstName = 'Client',
      lastName = '',
      email,
      totalDebt,
      monthlyPayment,
      payoffMonths,
      savings
    } = data;

    const uniqueId = Date.now();

    const slug = `${firstName}-${lastName}-${uniqueId}`
      .toLowerCase()
      .replace(/\s+/g, '-');

    // =========================
    // 1. CREATE PERSONALIZED PAGE
    // =========================

    const html = `
    <html>
    <head>
      <title>Debt Resolution Plan</title>
      <style>
        body { font-family: Arial; padding:40px; background:#f8fafc; }
        .card { background:white; padding:30px; border-radius:12px; }
        h1 { color:#009688; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>${firstName}, here’s your debt resolution plan</h1>

        <p>Total Debt: <b>$${totalDebt}</b></p>
        <p>Estimated Monthly: <b>$${monthlyPayment}</b></p>
        <p>Payoff Time: <b>${payoffMonths} months</b></p>
        <p style="color:#16a34a;font-weight:bold;">
          Estimated Savings: $${savings}
        </p>

        <hr/>

        <p>
        Staying in minimum payments can cost significantly more over time.
        This plan is designed to reduce your total cost and timeline.
        </p>

        <a href="https://calendly.com/YOUR-LINK">
          <button style="padding:12px 20px;background:#009688;color:white;border:none;border-radius:8px;">
            Schedule Your Call
          </button>
        </a>
      </div>
    </body>
    </html>
    `;

    // upload page
    const pageBlob = await put(`plans/${slug}.html`, html, {
      access: 'public'
    });

    const pageUrl = pageBlob.url;

    // =========================
    // 2. GENERATE SIMPLE PDF (placeholder)
    // =========================

    const pdfContent = Buffer.from(`
    Debt Resolution Summary

    Name: ${firstName} ${lastName}
    Total Debt: $${totalDebt}
    Monthly Payment: $${monthlyPayment}
    Payoff: ${payoffMonths} months
    Savings: $${savings}
    `);

    const pdfBlob = await put(`plans/${slug}.pdf`, pdfContent, {
      access: 'public'
    });

    const pdfUrl = pdfBlob.url;

    // =========================
    // 3. OPTIONAL: SEND TO GHL
    // =========================

    if (data.contactId) {
      await fetch(`https://rest.gohighlevel.com/v1/contacts/${data.contactId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${process.env.GHL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customField: {
            plan_url: pageUrl,
            pdf_url: pdfUrl
          }
        })
      });
    }

    return res.status(200).json({
      ok: true,
      pageUrl,
      pdfUrl
    });

  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message
    });
  }
}
