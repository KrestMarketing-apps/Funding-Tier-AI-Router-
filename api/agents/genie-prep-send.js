// Sends a Consumer Shield client the AI Genie prep sheet — the 16 recorded
// questions and the answer each one expects — by text and/or email, before the
// agent dials the Genie.
//
// Called from Step 6 of the Consumer Shield enrollment SOP
// (/agents/debt-validation/consumer-shield/enrollment-process). Gated to
// agents and admins by middleware.ts (/api/agents prefix).
//
// Delivery:
//   SMS   → app.krestmarketing.com conversations API, so it goes out from the
//           sub-account's number and lands in the contact's conversation.
//   Email → same conversations API; if that fails, Resend (the sender the
//           savings-plan email already uses) as a fallback.
// Needs GHL_PIT with contacts.readonly, contacts.write and
// conversations/message.write, plus GHL_LOCATION_ID. RESEND_API_KEY for the
// email fallback.

import GENIE from '../../genie-prep/genie-data.json';

const GHL = 'https://services.leadconnectorhq.com';
const TAG = 'cs genie prep sent';

function ghlHeaders(version = '2021-07-28') {
  return {
    Authorization: `Bearer ${(process.env.GHL_PIT || '').trim()}`,
    Version: version,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

function e164(raw) {
  const d = String(raw || '').replace(/\D/g, '');
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d.startsWith('1')) return `+${d}`;
  return null;
}

function esc(s) {
  return String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

async function findContact(locationId, { phone, email }) {
  const tries = [];
  if (phone) tries.push(`number=${encodeURIComponent(phone)}`);
  if (email) tries.push(`email=${encodeURIComponent(email)}`);
  for (const q of tries) {
    const r = await fetch(`${GHL}/contacts/search/duplicate?locationId=${locationId}&${q}`, { headers: ghlHeaders() });
    if (!r.ok) {
      const err = new Error(`Contact lookup failed (${r.status}): ${(await r.text()).slice(0, 200)}`);
      err.status = r.status;
      throw err;
    }
    const data = await r.json();
    if (data?.contact?.id) return data.contact;
  }
  return null;
}

async function sendGhl(payload) {
  const r = await fetch(`${GHL}/conversations/messages`, {
    method: 'POST',
    headers: ghlHeaders('2021-04-15'),
    body: JSON.stringify(payload),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`${r.status}: ${text.slice(0, 200)}`);
  return text;
}

function buildMessages({ lang, pay, firstName, link }) {
  const es = lang === 'es';
  const name = firstName || (es ? '' : 'there');
  const ans = (a) => (a === 'YES' ? (es ? 'SÍ' : 'YES') : a === 'NO' ? 'NO' : es ? 'SÍ o NO (cualquiera es válida)' : 'YES or NO (either is OK)');
  const payLine = pay === 'debit'
    ? (es ? 'su número de tarjeta de débito y su nombre tal como aparece en la tarjeta' : 'your debit card number and your name exactly as it appears on the card')
    : (es ? 'su número de ruta bancaria y su número de cuenta' : 'your bank routing number and account number');

  const sms = es
    ? `Hola${firstName ? ' ' + firstName : ''}, antes de su llamada de verificación de Shield Services, revise las 16 preguntas y la respuesta que espera cada una: ${link}\nResponda solo SÍ o NO, sin altavoz. Tenga listo ${payLine}. Si alguna respuesta no aplica a su caso, dígaselo a su especialista antes de la llamada.`
    : `Hi ${firstName || 'there'}, before your Shield Services verification call, please review the 16 questions and the answer each one expects: ${link}\nAnswer only YES or NO, and don't use speakerphone. Have ${payLine} ready. If any answer doesn't fit your situation, tell your specialist before the call.`;

  const rows = GENIE.questions.map((q) => {
    const color = q.ans === 'YES' ? '#0B7D6E' : q.ans === 'NO' ? '#B3261E' : '#022A51';
    const note = q[`yes_${lang}`] ? `<div style="margin-top:6px;font-size:13px;color:#5A3E00;background:#FFF8EC;padding:6px 10px;border-left:3px solid #B7791F;">${esc(q[`yes_${lang}`])}</div>` : '';
    return `<tr><td style="padding:10px 8px;vertical-align:top;font-weight:700;color:#4A5A6E;border-top:1px solid #E1E6EE;">Q${q.n}</td><td style="padding:10px 8px;vertical-align:top;border-top:1px solid #E1E6EE;">${esc(q[lang])}${note}</td><td style="padding:10px 8px;vertical-align:top;font-weight:700;color:${color};white-space:nowrap;border-top:1px solid #E1E6EE;">${ans(q.ans)}</td></tr>`;
  }).join('');

  const subject = es
    ? 'Su llamada de verificación de Shield Services: las 16 preguntas'
    : 'Your Shield Services verification call: the 16 questions';

  const html = `<div style="font-family:Arial,Helvetica,sans-serif;color:#0A182E;line-height:1.55;max-width:640px;">
<p>${es ? 'Hola' : 'Hi'}${name ? ' ' + esc(name) : ''},</p>
<p>${es
  ? 'Para terminar su inscripción tendrá una breve llamada grabada (unos 5 minutos) con María, nuestra asistente automática de verificación, mientras su especialista sigue en la línea. Estas son las preguntas y la respuesta que espera cada una.'
  : 'To finish your enrollment you’ll take a short recorded call (about 5 minutes) with Maria, our automated verification assistant, while your enrollment specialist stays on the line. Here are the questions and the answer each one expects.'}</p>
<p><a href="${esc(link)}" style="display:inline-block;background:#0F9D8A;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:700;">${es ? 'Ver la guía completa' : 'Open the full guide'}</a></p>
<p style="margin:0 0 4px;"><b>${es ? 'Antes de la llamada' : 'Before the call'}</b></p>
<ul style="margin:0 0 14px;padding-left:20px;">
<li>${es ? 'No use el altavoz.' : 'Don’t use speakerphone.'}</li>
<li>${es ? `Tenga listo: su nombre, teléfono, últimos 4 del Seguro Social, fecha de nacimiento, estado, plazo del programa en meses, fecha y monto de su pago mensual, y ${payLine}.` : `Have ready: your name, phone, last 4 of your Social, date of birth, state, program term in months, monthly payment date and amount, and ${payLine}.`}</li>
<li>${es ? 'Sus pagos aparecerán en su estado de cuenta como “Consumer Shield” o “Shield Services”.' : 'Your payments will show on your bank statement as “Consumer Shield” or “Shield Services.”'}</li>
<li>${es ? 'Responda solamente SÍ o NO. Otras frases no son válidas.' : 'Answer only YES or NO. Other phrases aren’t accepted.'}</li>
</ul>
<div style="background:#FFF8EC;border:1px solid #F0D9A8;border-radius:10px;padding:12px 14px;margin:0 0 14px;color:#5A3E00;font-size:14px;"><b>${es ? 'Siempre responda con la verdad.' : 'Always answer truthfully.'}</b> ${es
  ? 'Si su respuesta verdadera es diferente a la que aparece, dígaselo a su especialista antes de la llamada para resolverlo primero.'
  : 'If your true answer is different from the one shown, tell your enrollment specialist before the call so it can be sorted out first.'}</div>
<table style="border-collapse:collapse;width:100%;font-size:14px;">${rows}</table>
<p style="margin-top:16px;">${es
  ? 'Terminó cuando escuche <b>“¡Bienvenido a Shield Services!”</b>'
  : 'You’re done when you hear <b>“Welcome to Shield Services!”</b>'}</p>
</div>`;

  return { sms, subject, html };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const b = req.body || {};
  const lang = b.lang === 'es' ? 'es' : 'en';
  const pay = b.pay === 'debit' ? 'debit' : 'ach';
  const firstName = String(b.firstName || '').trim().slice(0, 40);
  const phone = e164(b.phone);
  const email = String(b.email || '').trim().toLowerCase();
  const wantSms = !!b.sms;
  const wantEmail = !!b.email_on;
  const term = String(b.term || '').replace(/\D/g, '').slice(0, 3);
  const amount = String(b.amount || '').replace(/[^0-9.]/g, '').slice(0, 8);
  const date = String(b.date || '').trim().slice(0, 30);

  if (!wantSms && !wantEmail) return res.status(400).json({ ok: false, error: 'Pick text, email or both.' });
  if (wantSms && !phone) return res.status(400).json({ ok: false, error: 'Enter the client’s 10-digit mobile number.' });
  if (wantEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ ok: false, error: 'Enter a valid email address.' });

  const origin = (process.env.PUBLIC_ORIGIN || `https://${req.headers.host}`).replace(/\/$/, '');
  const qs = new URLSearchParams({ v: pay, lang });
  if (firstName) qs.set('n', firstName);
  if (term) qs.set('t', term);
  if (amount) qs.set('a', amount);
  if (date) qs.set('d', date);
  const link = `${origin}/genie-prep?${qs.toString()}`;
  const msg = buildMessages({ lang, pay, firstName, link });

  const result = { ok: true, link, sms: null, email: null, tagged: false };
  const locationId = (process.env.GHL_LOCATION_ID || '').trim();

  let contact = null;
  let lookupError = null;
  if (process.env.GHL_PIT && locationId) {
    try {
      contact = await findContact(locationId, { phone, email: wantEmail ? email : '' });
    } catch (e) {
      lookupError = e.message;
    }
  } else {
    lookupError = 'GHL_PIT or GHL_LOCATION_ID is not set.';
  }

  if (wantSms) {
    if (!contact) {
      result.sms = { ok: false, error: lookupError || 'No contact with that number in app.krestmarketing.com. Check the number, or copy the text message and send it yourself.' };
    } else {
      try {
        await sendGhl({ type: 'SMS', contactId: contact.id, message: msg.sms });
        result.sms = { ok: true };
      } catch (e) {
        result.sms = { ok: false, error: `Text not sent (${e.message})` };
      }
    }
  }

  if (wantEmail) {
    let sent = false;
    if (contact) {
      try {
        await sendGhl({ type: 'Email', contactId: contact.id, subject: msg.subject, html: msg.html, emailTo: email });
        sent = true;
        result.email = { ok: true, via: 'app.krestmarketing.com' };
      } catch (e) {
        result.email = { ok: false, error: e.message };
      }
    }
    if (!sent && process.env.RESEND_API_KEY) {
      try {
        const r = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'Enrollment Team <success@emailservice.fundingtier.com>',
            reply_to: 'success@fundingtier.com',
            to: [email],
            subject: msg.subject,
            html: msg.html,
          }),
        });
        if (!r.ok) throw new Error(`${r.status}: ${(await r.text()).slice(0, 200)}`);
        result.email = { ok: true, via: 'resend' };
      } catch (e) {
        result.email = { ok: false, error: `Email not sent (${e.message})` };
      }
    } else if (!sent && !result.email) {
      result.email = { ok: false, error: lookupError || 'Email not sent.' };
    }
  }

  if (contact && (result.sms?.ok || result.email?.ok)) {
    try {
      const r = await fetch(`${GHL}/contacts/${contact.id}/tags`, {
        method: 'POST',
        headers: ghlHeaders(),
        body: JSON.stringify({ tags: [TAG, `${TAG} - ${pay} ${lang}`] }),
      });
      result.tagged = r.ok;
    } catch (e) {
      /* the tag is a nice-to-have; the send already happened */
    }
  }

  result.ok = !!((!wantSms || result.sms?.ok) && (!wantEmail || result.email?.ok));
  return res.status(result.ok ? 200 : 207).json(result);
}
