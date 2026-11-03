import { REQUIRED_DISCLOSURES } from '../agents/prospect-program-content.js';

const ESTIMATE_LINE =
  'The figures in your plan are estimates based on the information you shared. Actual results vary.';

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// Only http(s) links are allowed into the button href.
function safeUrl(value = '') {
  const s = String(value || '').trim();
  return /^https?:\/\//i.test(s) ? s : '';
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ ok: false, error: 'Method not allowed' });
    }

    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({
        ok: false,
        error: 'Missing RESEND_API_KEY in Vercel environment variables'
      });
    }

    const {
      to,
      subject,
      text,
      firstName = '',
      pageUrl = '',
      filename,
      pdfBase64
    } = req.body || {};

    if (!to) {
      return res.status(400).json({ ok: false, error: 'Missing recipient email' });
    }

    if (!pdfBase64) {
      return res.status(400).json({ ok: false, error: 'Missing PDF attachment data' });
    }

    const name = String(firstName || '').trim();
    const greeting = name ? `Hi ${name},` : 'Hello,';
    const greetingHtml = name ? `Hi ${escapeHtml(name)},` : 'Hello,';
    const url = safeUrl(pageUrl);
    const hasAttachment = Boolean(pdfBase64);
    const disclosuresText = REQUIRED_DISCLOSURES.join(' ');

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif; color:#0f172a; line-height:1.6;">
        <h2 style="margin:0 0 14px; color:#0f766e;">Your Personalized Debt Resolution Plan</h2>
        <p style="margin:0 0 14px;">${greetingHtml}</p>
        <p style="margin:0 0 14px;">
          Your personalized debt resolution plan is ready.
        </p>
        ${
          url
            ? `<p style="margin:0 0 10px;">
                <a href="${escapeHtml(url)}" style="display:inline-block; background:#0f766e; color:#ffffff; text-decoration:none; padding:12px 18px; border-radius:8px; font-weight:700;">
                  View Your Personalized Plan
                </a>
              </p>`
            : ''
        }
        <p style="margin:0 0 14px; font-size:13px; color:#475569;">${escapeHtml(ESTIMATE_LINE)}</p>
        ${
          hasAttachment
            ? `<p style="margin:0 0 14px;">
          A PDF summary is also attached for your review.
        </p>`
            : ''
        }
        <p style="margin:18px 0 0;">Funding Tier</p>
        <p style="margin:24px 0 0; padding-top:12px; border-top:1px solid #e2e8f0; font-size:11px; line-height:1.6; color:#64748b;">
          ${escapeHtml(disclosuresText)}
        </p>
      </div>
    `;

    const plainText =
      text ||
      `${greeting}

Your personalized debt resolution plan is ready.

${url ? `View your plan here:\n${url}\n\n` : ''}${ESTIMATE_LINE}

${hasAttachment ? 'A PDF summary is also attached for your review.\n\n' : ''}Funding Tier

${disclosuresText}`;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Funding Tier <success@emailservice.fundingtier.com>',
        reply_to: 'success@fundingtier.com',
        to: [to],
        subject: subject || 'Your Personalized Debt Resolution Plan',
        text: plainText,
        html,
        attachments: [
          {
            filename: filename || 'Funding-Tier-Debt-Resolution-Summary.pdf',
            content: pdfBase64
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        error: data?.message || data?.error || 'Resend API error',
        details: data
      });
    }

    return res.status(200).json({ ok: true, result: data });
  } catch (error) {
    console.error('send-savings-email crash:', error);
    return res.status(500).json({
      ok: false,
      error: error?.message || 'Server failed to send email'
    });
  }
}
