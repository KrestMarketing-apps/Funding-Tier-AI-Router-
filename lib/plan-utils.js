export const APP_BASE_URL =
  process.env.APP_BASE_URL || 'https://ai.fundingtier.com';

export const FUNDING_TIER_LOGO_URL =
  'https://assets.cdn.filesafe.space/S4ztIlDxBovAboldwbOR/media/68783cf8e8df54a8b29097c4.png';

export function currency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

export function safeNumber(value) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
}

export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function createPlanId() {
  return `ftplan-${Math.random().toString(36).slice(2, 10)}`;
}

export function buildSlug(firstName, lastName, planId) {
  const name = slugify(`${firstName || ''} ${lastName || ''}`.trim() || 'client');
  return `${name}-${planId}`;
}

export function extractPlanIdFromSlug(slug) {
  const match = String(slug || '').match(/(ftplan-[a-z0-9]+)$/i);
  return match ? match[1] : '';
}

export function buildPlanUrls(firstName, lastName, planId) {
  const slug = buildSlug(firstName, lastName, planId);
  return {
    slug,
    pageUrl: `${APP_BASE_URL}/plan/${slug}`,
    pdfUrl: `${APP_BASE_URL}/plan/${slug}/pdf`
  };
}

export function nowIso() {
  return new Date().toISOString();
}

export function calcSavings(doNothing, recommended) {
  return Math.max(
    0,
    safeNumber(doNothing?.totalPayback) - safeNumber(recommended?.totalCost)
  );
}

export function buildPlanRecord(input) {
  const firstName = String(input.firstName || '').trim();
  const lastName = String(input.lastName || '').trim();
  const email = String(input.email || '').trim();
  const contactId = String(input.contactId || '').trim();

  const planId = String(input.planId || '').trim() || createPlanId();
  const { slug, pageUrl, pdfUrl } = buildPlanUrls(firstName, lastName, planId);

  return {
    planId,
    slug,
    pageUrl,
    pdfUrl,
    firstName,
    lastName,
    email,
    contactId,
    state: input.state || '',
    route: input.route || '',
    routeReason: input.routeReason || '',
    totalDebt: safeNumber(input.totalDebt),
    doNothing: input.doNothing || {},
    shortest: input.shortest || {},
    recommended: input.recommended || {},
    rows: Array.isArray(input.rows) ? input.rows : [],
    generatedAt: nowIso()
  };
}
