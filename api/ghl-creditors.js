import creditors from '../lib/creditors.json';

function normalize(value = '') {
  return String(value).toLowerCase().trim();
}

function includesSearch(text, search) {
  return normalize(text).includes(search);
}

function scoreCreditor(item, search) {
  const name = normalize(item.display_name);
  const aliases = Array.isArray(item.search_aliases) ? item.search_aliases.map(normalize) : [];
  const tokens = Array.isArray(item.search_tokens) ? item.search_tokens.map(normalize) : [];
  const index = Array.isArray(item.search_index) ? item.search_index.map(normalize) : [];

  let score = 0;

  if (name === search) score += 1000;
  else if (name.startsWith(search)) score += 700;
  else if (name.includes(search)) score += 500;

  if (aliases.some(a => a === search)) score += 650;
  else if (aliases.some(a => a.startsWith(search))) score += 450;
  else if (aliases.some(a => a.includes(search))) score += 300;

  if (tokens.some(t => t === search)) score += 350;
  else if (tokens.some(t => t.includes(search))) score += 180;

  if (index.some(i => i === search)) score += 250;
  else if (index.some(i => i.includes(search))) score += 120;

  // unsecured first
  score += Number(item.unsecured_priority || 0) * 100;
  if (!item.secured) score += 100;

  // eligible results before excluded/special handling
  if (String(item.eligible_for_enrollment || '').toLowerCase() === 'yes') score += 80;
  if (String(item.routing_category || '').toLowerCase().includes('excluded')) score -= 120;

  return score;
}

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const search = normalize(req.query.search || '');

  let results = creditors;

  if (search) {
    results = creditors.filter((item) => {
      const fields = [
        item.display_name,
        ...(Array.isArray(item.search_aliases) ? item.search_aliases : []),
        ...(Array.isArray(item.search_tokens) ? item.search_tokens : []),
        ...(Array.isArray(item.search_index) ? item.search_index : [])
      ];

      return fields.some((field) => includesSearch(field, search));
    });
  }

  results = results
    .map((item) => ({
      ...item,
      _score: scoreCreditor(item, search)
    }))
    .sort((a, b) => b._score - a._score)
    .slice(0, 12)
    .map(({ _score, ...item }) => item);

  return res.status(200).json({
    ok: true,
    results
  });
}
