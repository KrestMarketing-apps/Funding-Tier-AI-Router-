/*
 * Funding Tier program pricing — ONE source of truth.
 *
 * Loaded two ways:
 *   - Browser: <script src="/lib/program-pricing.js"> in index.html, which then
 *     reads window.FT_PRICING for the tier tables, fee constants and state lists.
 *   - Node (Vercel function): api/router/route.js imports it (CommonJS) so the
 *     GoHighLevel webhook prices a plan exactly the way the router UI does.
 *
 * Plain script on purpose (no ESM syntax) so the same file works in both.
 * Change a tier, a fee or a state list HERE and nowhere else.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.FT_PRICING = api;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null), function () {
  'use strict';

  const num = (v) => { const n = parseFloat(String(v == null ? '' : v).replace(/[^0-9.]/g, '')); return Number.isFinite(n) ? n : 0; };

  // ── Shield Services (debt validation): priced by enrolled-debt band ──
  const CS_PROGS = [
    { k: 'A', range: '$4,000-$4,999',   min: 4000,  max: 4999,     pay: 220, term: 18, comm: { p2: 150, p4: 0,   total: 150 } },
    { k: 'B', range: '$5,000-$8,799',   min: 5000,  max: 8799,     pay: 220, term: 24, comm: { p2: 150, p4: 0,   total: 150 } },
    { k: 'C', range: '$8,800-$9,999',   min: 8800,  max: 9999,     pay: 220, term: 36, comm: { p2: 150, p4: 0,   total: 150 } },
    { k: 'D', range: '$10,000-$14,999', min: 10000, max: 14999,    pay: 270, term: 36, comm: { p2: 175, p4: 50,  total: 225 } },
    { k: 'E', range: '$15,000-$19,999', min: 15000, max: 19999,    pay: 320, term: 36, comm: { p2: 200, p4: 75,  total: 275 } },
    { k: 'F', range: '$20,000-$24,999', min: 20000, max: 24999,    pay: 370, term: 36, comm: { p2: 250, p4: 100, total: 350 } },
    { k: 'G', range: '$25,000-$29,999', min: 25000, max: 29999,    pay: 420, term: 36, comm: { p2: 300, p4: 100, total: 400 } },
    { k: 'H', range: '$30,000-$49,999', min: 30000, max: 49999,    pay: 520, term: 36, comm: { p2: 375, p4: 125, total: 500 } },
    { k: 'I', range: '$50,000+',        min: 50000, max: Infinity, pay: 620, term: 36, comm: { p2: 450, p4: 150, total: 600 } }
  ];
  const CS_SERVICING_FEE_PER_PAYMENT = 40; // deducted by Shield from each client payment; already inside `pay`

  // ── Level Debt (debt settlement) ──
  const LD = {
    minTotalDebt: 7000,
    minMonthlyDeposit: 250,
    settlementPct: 0.50,
    successFeeStandard: 0.25,
    successFeeAttorney: 0.27,
    gatewayFeeMonthly: 10.95,
    gatewaySetupFee: 10.95,
    legalFeeMonthly: 19.99,
    splitSurchargePerPayment: 0.515,
    minTerm: 12,
    termRules: [
      { label: 'Debt enrolled $7,000 – $9,999',   debtMin: 7000,  debtMax: 9999,     maxTerm: 24 },
      { label: 'Debt enrolled $10,000 – $12,499', debtMin: 10000, debtMax: 12499,    maxTerm: 30 },
      { label: 'Debt enrolled $12,500 – $14,999', debtMin: 12500, debtMax: 14999,    maxTerm: 36 },
      { label: 'Debt enrolled $15,000 – $24,999', debtMin: 15000, debtMax: 24999,    maxTerm: 42 },
      { label: 'Debt enrolled $25,000 – $34,999', debtMin: 25000, debtMax: 34999,    maxTerm: 48 },
      { label: 'Debt enrolled $35,000 – $49,999', debtMin: 35000, debtMax: 49999,    maxTerm: 54 },
      { label: 'Debt enrolled $50,000+',          debtMin: 50000, debtMax: Infinity, maxTerm: 60 }
    ]
  };

  // ── Elite Legal Practice / Legacy Capital Services (debt resolution) ──
  const ELP = {
    minTotalDebt: 6000,
    feeRateDefault: 0.49,
    feeRateMin: 0.35,
    feeRateMax: 0.49,
    maintenanceFeeMonthly: 80,
    draftFeePerDraft: 4,
    minClientPayment: 250,
    maxTermMonths: 60,
    legalDefenseFeeWithinYear: 675,   // summons received within 1 year of enrollment
    legalDefenseFeeNotEnrolled: 850,  // the debt being sued on is not enrolled
    commissionBands: [
      { code: 'L1', min: 6000,  max: 9999,     total: 150, p2: 150, p4: 0 },
      { code: 'L2', min: 10000, max: 14999,    total: 225, p2: 175, p4: 50 },
      { code: 'L3', min: 15000, max: 19999,    total: 275, p2: 200, p4: 75 },
      { code: 'L4', min: 20000, max: 24999,    total: 350, p2: 250, p4: 100 },
      { code: 'L5', min: 25000, max: 29999,    total: 400, p2: 300, p4: 100 },
      { code: 'L6', min: 30000, max: 49999,    total: 500, p2: 375, p4: 125 },
      { code: 'L7', min: 50000, max: Infinity, total: 600, p2: 450, p4: 150 }
    ]
  };

  // ── State lists ──
  const STATES = {
    ldBlackout:     ['AK', 'RI', 'VT', 'WV', 'OR', 'GU', 'HI', 'ME', 'MT', 'PR', 'SC', 'SD', 'UT', 'WI', 'CO', 'ND'],
    ldAttorney:     ['CT', 'GA', 'LA', 'MN', 'NV', 'NH', 'NJ', 'OH', 'PA', 'TN', 'WA', 'WY'],
    csBlackout:     ['NC', 'PA', 'CO', 'WA', 'CT', 'NJ', 'OR', 'TX'],
    legacyBlackout: ['ID', 'ND', 'GA']
  };

  // ── Routing bands by total enrolled debt ──
  const ROUTING = { csMin: 4000, elpMin: 6000, ldMin: 7000 };

  // Band lookup without gaps between tiers ($4,999.50 lands in the $4,000-$4,999 band).
  function findBand(list, d, minKey, maxKey) {
    minKey = minKey || 'min'; maxKey = maxKey || 'max';
    const v = num(d);
    return list.find((p) => v >= p[minKey] && (p[maxKey] === Infinity || v < p[maxKey] + 1)) || null;
  }
  const getCsProg = (d) => findBand(CS_PROGS, d);
  const getLegacyComm = (d) => findBand(ELP.commissionBands, d);
  const getLDMaxTerm = (d) => { const r = findBand(LD.termRules, d, 'debtMin', 'debtMax'); return r ? r.maxTerm : 0; };

  // ── Level Debt pricing ──
  function ldFeeRate(state) { return STATES.ldAttorney.includes(String(state || '').toUpperCase()) ? LD.successFeeAttorney : LD.successFeeStandard; }
  function ldMonthlyFees(splitPay) { return LD.gatewayFeeMonthly + LD.legalFeeMonthly + (splitPay ? LD.splitSurchargePerPayment * 2 : 0); }
  function ldFixedCost(total, feeRate) { return num(total) * LD.settlementPct + num(total) * num(feeRate) + LD.gatewaySetupFee; }
  function ldProgramCost(total, feeRate, term, splitPay) {
    if (!num(total)) return 0;
    const t = Math.max(1, parseInt(term, 10) || getLDMaxTerm(total) || 12);
    return ldFixedCost(total, feeRate) + ldMonthlyFees(splitPay) * t;
  }
  // Longest term whose payment still clears the $250 minimum deposit.
  function ldEffectiveMaxTerm(total, feeRate, splitPay) {
    const maxByDebt = getLDMaxTerm(total);
    if (!maxByDebt) return 0;
    const headroom = LD.minMonthlyDeposit - ldMonthlyFees(splitPay);
    const maxByMin = headroom > 0 ? Math.floor(ldFixedCost(total, feeRate) / headroom) : maxByDebt;
    const eff = Math.min(maxByDebt, maxByMin > 0 ? maxByMin : maxByDebt);
    return Math.max(LD.minTerm, eff || 0);
  }
  // Rounded monthly payment; total is DEFINED as monthly × term so the two always reconcile.
  function ldPriced(total, feeRate, term, splitPay) {
    const t = Math.max(1, parseInt(term, 10) || 1);
    const mp = Math.round(ldProgramCost(total, feeRate, t, splitPay) / t);
    return { term: t, mp, tc: mp * t };
  }

  // ── ELP pricing ──
  function legacyDraftCount(splitPay) { return splitPay ? 2 : 1; }
  function legacyMonthlyAdminFees(splitPay) { return ELP.maintenanceFeeMonthly + ELP.draftFeePerDraft * legacyDraftCount(splitPay); }
  function legacyTotalServiceFee(d, f) { return Math.round(num(d) * num(f)); }
  // Longest term that keeps the client payment at or above $250, capped at 60.
  function legacyMaxMonths(d, f, splitPay) {
    const fee = legacyTotalServiceFee(d, f);
    const maxByPayment = Math.floor(fee / Math.max(1, ELP.minClientPayment - legacyMonthlyAdminFees(splitPay)));
    return Math.max(1, Math.min(ELP.maxTermMonths, maxByPayment > 0 ? maxByPayment : ELP.maxTermMonths));
  }
  function legacyClampMonths(d, f, mo, splitPay) {
    const n = parseInt(mo, 10);
    return Math.max(1, Math.min(legacyMaxMonths(d, f, splitPay), Number.isFinite(n) ? n : 1));
  }
  function legacyPriced(d, f, mo, splitPay) {
    const m = legacyClampMonths(d, f, mo, splitPay);
    const mp = Math.round(legacyTotalServiceFee(d, f) / m + legacyMonthlyAdminFees(splitPay));
    return { term: m, mp, tc: mp * m };
  }
  // Default ELP term: payment matched to the cheapest alternative program, clamped.
  function legacyDefaultMonths(total, feeRate, targets, splitPay) {
    const maxMo = legacyMaxMonths(total, feeRate, splitPay);
    const list = (targets || []).filter((v) => v && v > 0);
    if (!list.length) return Math.max(1, Math.min(maxMo, 36));
    const ideal = Math.round(legacyTotalServiceFee(total, feeRate) / Math.max(1, Math.min.apply(null, list) - legacyMonthlyAdminFees(splitPay)));
    return legacyClampMonths(total, feeRate, ideal, splitPay);
  }

  // ── Eligibility by state + total (creditor-level rules live in index.html) ──
  function availability(total, state) {
    const st = String(state || '').toUpperCase();
    const t = num(total);
    return {
      cs: t >= ROUTING.csMin && !STATES.csBlackout.includes(st),
      ld: t >= ROUTING.ldMin && !STATES.ldBlackout.includes(st),
      legacy: t >= ROUTING.elpMin && !STATES.legacyBlackout.includes(st)
    };
  }

  // Prices every eligible program and picks the prospect-facing default:
  // Shield Services when eligible, else the lowest total cost.
  function priceAll(total, state, opts) {
    opts = opts || {};
    const t = num(total);
    const av = availability(t, state);
    const out = {};
    const cs = getCsProg(t);
    if (av.cs && cs) out['CONSUMER SHIELD'] = { term: cs.term, mp: cs.pay, tc: cs.pay * cs.term, label: 'Program ' + cs.k };
    if (av.ld) {
      const rate = ldFeeRate(state);
      const term = ldEffectiveMaxTerm(t, rate, !!opts.splitPay);
      if (term) out.LEVEL = Object.assign(ldPriced(t, rate, term, !!opts.splitPay), { serviceFeePct: Math.round(rate * 100) });
    }
    if (av.legacy) {
      const f = opts.legacyFeeRate || ELP.feeRateDefault;
      const targets = [out['CONSUMER SHIELD'] && out['CONSUMER SHIELD'].mp, out.LEVEL && out.LEVEL.mp];
      const mo = legacyDefaultMonths(t, f, targets, !!opts.splitPay);
      out.LEGACY = Object.assign(legacyPriced(t, f, mo, !!opts.splitPay), { serviceFeePct: Math.round(f * 100), monthlyAdminFees: legacyMonthlyAdminFees(!!opts.splitPay) });
    }
    let def = out['CONSUMER SHIELD'] ? 'CONSUMER SHIELD' : '';
    if (!def) { let best = Infinity; Object.keys(out).forEach((k) => { if (out[k].tc < best) { best = out[k].tc; def = k; } }); }
    return { availability: av, programs: out, defaultRoute: def };
  }

  // ── "Do nothing" path: fixed payment amortization + minimum-payment rule ──
  const CC = { defaultApr: 0.28, minPercent: 0.03, principalPlusInterestPercent: 0.01, flatMinimum: 35, maxMonths: 720 };
  function normalizeApr(apr) { const a = num(apr); return a > 1 ? a / 100 : a; }
  function startingMinimumPayment(balance, apr) {
    const b = num(balance), r = normalizeApr(apr) / 12;
    return Math.min(b + b * r, Math.max(CC.flatMinimum, b * CC.minPercent, b * CC.principalPlusInterestPercent + b * r));
  }
  function minimumOnlyPayoff(balance, apr) {
    let b = num(balance), m = 0, interest = 0, paid = 0; const r = normalizeApr(apr) / 12;
    while (b > 0.005 && m < CC.maxMonths) {
      m++; const i = b * r; const pay = Math.min(b + i, Math.max(CC.flatMinimum, b * CC.minPercent, b * CC.principalPlusInterestPercent + i));
      if (pay - i <= 0) return { ok: false, months: m, interest, paid };
      b = b + i - pay; interest += i; paid += pay;
    }
    return { ok: b <= 0.01, months: m, interest: Math.round(interest), paid: Math.round(paid) };
  }
  function fixedPaymentPayoff(balance, apr, payment) {
    let b = num(balance), m = 0, interest = 0, paid = 0; const r = normalizeApr(apr) / 12; const p = num(payment);
    const snap = { balanceAt36: 0, interestAt36: 0, paidAt36: 0 };
    const neverPaysOff = p <= b * r;
    while (b > 0.005 && m < CC.maxMonths) {
      m++; const i = b * r; b += i; const a = Math.min(p, b); b -= a; interest += i; paid += a;
      if (m === 36) { snap.balanceAt36 = Math.round(b); snap.interestAt36 = Math.round(interest); snap.paidAt36 = Math.round(paid); }
      if (neverPaysOff && m >= 36) break;
    }
    if (m < 36) { snap.balanceAt36 = 0; snap.interestAt36 = Math.round(interest); snap.paidAt36 = Math.round(paid); }
    return Object.assign({ neverPaysOff, months: neverPaysOff ? 0 : m, interest: neverPaysOff ? null : Math.round(interest), paid: neverPaysOff ? null : Math.round(paid) }, snap);
  }
  function yearsMonths(m) { const y = Math.floor(m / 12), r = m % 12; if (!m) return 'N/A'; if (!y) return r + ' month' + (r === 1 ? '' : 's'); return y + ' year' + (y === 1 ? '' : 's') + (r ? ', ' + r + ' month' + (r === 1 ? '' : 's') : ''); }

  return {
    CS_PROGS, CS_SERVICING_FEE_PER_PAYMENT, LD, ELP, STATES, ROUTING, CC,
    findBand, getCsProg, getLegacyComm, getLDMaxTerm,
    ldFeeRate, ldMonthlyFees, ldFixedCost, ldProgramCost, ldEffectiveMaxTerm, ldPriced,
    legacyDraftCount, legacyMonthlyAdminFees, legacyTotalServiceFee, legacyMaxMonths, legacyClampMonths, legacyPriced, legacyDefaultMonths,
    availability, priceAll,
    normalizeApr, startingMinimumPayment, minimumOnlyPayoff, fixedPaymentPayoff, yearsMonths
  };
});
