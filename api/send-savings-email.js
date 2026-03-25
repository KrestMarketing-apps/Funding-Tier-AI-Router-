// /api/send-savings-email.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, text, filename, pdfBase64 } = req.body;

    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({ error: 'Missing RESEND_API_KEY in Vercel environment variables' });
    }

    if (!to || !pdfBase64) {
      return res.status(400).json({ error: 'Missing required fields: to or pdfBase64' });
    }

    const result = await resend.emails.send({
      from: 'Funding Tier <success@fundingtier.com>',
      to,
      subject: subject || 'Your Estimated Debt Relief Savings Snapshot',
      text: text || 'Hello, please view the attachment to better understand how you can save through a debt settlement program.',
      replyTo: 'success@fundingtier.com',
      attachments: [
        {
          filename: filename || 'DEBT SETTLEMENT - SAVINGS SCENARIO.pdf',
          content: pdfBase64,
        },
      ],
    });

    return res.status(200).json({ ok: true, result });
  } catch (error) {
    return res.status(500).json({
      error: error?.message || 'Failed to send email',
      details: error,
    });
  }
}
