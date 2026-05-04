import { put } from '@vercel/blob';

function currency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value || 0);
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
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

    const fullName = `${firstName} ${lastName}`.trim();
    const safeName = slugify(fullName || 'client');
    const unique = Date.now();
    const slug = `${safeName}-debt-resolution-plan-${unique}`;

    const savings = Math.max(
      0,
      Number(doNothing.totalPayback || 0) - Number(recommended.totalCost || 0)
    );

    const planData = {
      slug,
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
      rows,
      savings,
      createdAt: new Date().toISOString()
    };

    // Store JSON data for the clean /plan/:slug page to read later
    const dataBlob = await put(`plans/${slug}.json`, JSON.stringify(planData, null, 2), {
      access: 'public',
      contentType: 'application/json'
    });

    const origin = getOrigin(req);
    const pageUrl = `${origin}/plan/${slug}`;

    // Placeholder PDF for now
    const pdfText = `
Funding Tier Debt Resolution Summary

Prepared for: ${fullName}
Email: ${email}
State: ${state}

Total Debt Reviewed: ${currency(totalDebt)}
Current Monthly Path: ${currency(doNothing.monthlyPayment || 0)}
Recommended Monthly: ${currency(recommended.monthlyPayment || 0)}
Recommended Term: ${recommended.term || '—'} months
Estimated Total Payback (Current): ${currency(doNothing.totalPayback || 0)}
Estimated Total Payback (Recommended): ${currency(recommended.totalCost || 0)}
Estimated Savings: ${currency(savings)}

Route: ${route}
Reason: ${routeReason}

Plan Data URL:
${dataBlob.url}
    `.trim();

    const pdfBlob = await put(`plans/${slug}.pdf`, Buffer.from(pdfText, 'utf8'), {
      access: 'public',
      contentType: 'application/pdf'
    });

return res.status(200).json({
  ok: true,
  slug,
  pageUrl,
  pdfUrl: pdfBlob.url,
  dataUrl: dataBlob.url,
  route   // 👈 ADD THIS
});
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message || 'Server error'
    });
  }
}
