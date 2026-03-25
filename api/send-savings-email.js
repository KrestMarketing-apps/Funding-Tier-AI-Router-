export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({
        error: 'Missing RESEND_API_KEY in Vercel environment variables'
      });
    }

    const { to, subject, text, filename, pdfBase64 } = req.body || {};

    if (!to) {
      return res.status(400).json({ error: 'Missing recipient email' });
    }

    if (!pdfBase64) {
      return res.status(400).json({ error: 'Missing PDF attachment data' });
    }

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
        subject: subject || 'Your Estimated Debt Relief Savings Snapshot',
        text:
          text ||
          'Hello, please view the attachment to better understand how you can save through a debt settlement program.',
        reply_to: 'success@fundingtier.com',
        attachments: [
          {
            filename: filename || 'DEBT SETTLEMENT - SAVINGS SCENARIO.pdf',
            content: pdfBase64
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.message || data?.error || 'Resend API error',
        details: data
      });
    }

    return res.status(200).json({ ok: true, result: data });
  } catch (error) {
    console.error('send-savings-email crash:', error);
    return res.status(500).json({
      error: error?.message || 'Server failed to send email'
    });
  }
}
