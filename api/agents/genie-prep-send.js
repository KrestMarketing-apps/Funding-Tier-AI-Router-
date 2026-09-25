// Step 6 of the Consumer Shield SOP: "Send to client".
//
// Adds the matching Genie prep tag to the contact in app.krestmarketing.com
// (Funding Tier sub-account). The tag triggers one of four workflows in the
// "Shield Services-Consumer Shield" folder, which text and email the client
// the 16 Genie questions with the expected answers, then remove the tag so
// it can be sent again later:
//
//   Shield Services-Consumer Shield-Genie Prep-ACH-English
//   Shield Services-Consumer Shield-Genie Prep-ACH-Spanish
//   Shield Services-Consumer Shield-Genie Prep-Debit-English
//   Shield Services-Consumer Shield-Genie Prep-Debit-Spanish
//
// The message copy lives in those workflows, not here, so it can be edited
// in app.krestmarketing.com without a deploy.
// Needs GHL_PIT (contacts.readonly + contacts.write) and GHL_LOCATION_ID.
// Gated to agents and admins by middleware.ts (/api/agents prefix).

const GHL = 'https://services.leadconnectorhq.com';

const TAGS = {
  'ach|en': 'Shield Services-Consumer Shield-Genie Prep-ACH-English',
  'ach|es': 'Shield Services-Consumer Shield-Genie Prep-ACH-Spanish',
  'debit|en': 'Shield Services-Consumer Shield-Genie Prep-Debit-English',
  'debit|es': 'Shield Services-Consumer Shield-Genie Prep-Debit-Spanish',
};

function headers() {
  return {
    Authorization: `Bearer ${(process.env.GHL_PIT || '').trim()}`,
    Version: '2021-07-28',
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

async function findContact(locationId, phone, email) {
  const tries = [];
  if (phone) tries.push(`number=${encodeURIComponent(phone)}`);
  if (email) tries.push(`email=${encodeURIComponent(email)}`);
  for (const q of tries) {
    const r = await fetch(`${GHL}/contacts/search/duplicate?locationId=${locationId}&${q}`, { headers: headers() });
    if (!r.ok) throw new Error(`Contact lookup failed (${r.status}): ${(await r.text()).slice(0, 200)}`);
    const data = await r.json();
    if (data?.contact?.id) return data.contact;
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const b = req.body || {};
  const key = `${b.pay === 'debit' ? 'debit' : 'ach'}|${b.lang === 'es' ? 'es' : 'en'}`;
  const tag = TAGS[key];
  const phone = e164(b.phone);
  const email = String(b.email || '').trim().toLowerCase();

  if (!phone && !email) return res.status(400).json({ ok: false, error: 'Enter the client’s mobile number or email so we can find the contact.' });

  const locationId = (process.env.GHL_LOCATION_ID || '').trim();
  if (!process.env.GHL_PIT || !locationId) {
    return res.status(500).json({ ok: false, tag, error: 'GHL_PIT or GHL_LOCATION_ID is not set.' });
  }

  try {
    const contact = await findContact(locationId, phone, email);
    if (!contact) {
      return res.status(404).json({ ok: false, tag, error: 'No contact with that number or email in app.krestmarketing.com.' });
    }
    const r = await fetch(`${GHL}/contacts/${contact.id}/tags`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ tags: [tag] }),
    });
    if (!r.ok) throw new Error(`Tag not added (${r.status}): ${(await r.text()).slice(0, 200)}`);
    const name = [contact.firstName, contact.lastName].filter(Boolean).join(' ') || contact.contactName || '';
    return res.status(200).json({ ok: true, tag, contactId: contact.id, contactName: name });
  } catch (e) {
    return res.status(502).json({ ok: false, tag, error: e.message });
  }
}
