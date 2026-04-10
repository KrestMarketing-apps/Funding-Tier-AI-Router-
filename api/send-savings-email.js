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
      firstName = 'Client',
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

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif; color:#0f172a; line-height:1.6;">
        <h2 style="margin:0 0 14px; color:#0f766e;">Your Personalized Debt Resolution Plan</h2>
        <p style="margin:0 0 14px;">Hi ${firstName},</p>
        <p style="margin:0 0 14px;">
          Your personalized debt resolution plan is ready.
        </p>
        ${
          pageUrl
            ? `<p style="margin:0 0 18px;">
                <a href="${pageUrl}" style="display:inline-block; background:#0f766e; color:#ffffff; text-decoration:none; padding:12px 18px; border-radius:8px; font-weight:700;">
                  View Your Personalized Plan
                </a>
              </p>`
            : ''
        }
        <p style="margin:0 0 14px;">
          A PDF summary is also attached for your review.
        </p>
        <p style="margin:18px 0 0;">Funding Tier</p>
      </div>
    `;

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
        text:
          text ||
          `Hi ${firstName},

Your personalized debt resolution plan is ready.

${pageUrl ? `View your plan here:\n${pageUrl}\n\n` : ''}A PDF summary is also attached for your review.

Funding Tier`,
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
