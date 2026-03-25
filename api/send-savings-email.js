export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || 'Funding Tier <noreply@yourdomain.com>';

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing RESEND_API_KEY environment variable.' });
  }

  try {
    const { to, subject, text, filename, pdfBase64 } = req.body || {};

    if (!to || !subject || !text || !filename || !pdfBase64) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject,
        text,
        attachments: [
          {
            filename,
            content: pdfBase64
          }
        ]
      })
    });

    const data = await resendResponse.json();

    if (!resendResponse.ok) {
      return res.status(resendResponse.status).json({ error: data });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to send email.',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
