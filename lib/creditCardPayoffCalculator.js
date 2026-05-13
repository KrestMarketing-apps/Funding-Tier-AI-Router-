/**
 * Funding Tier Deal Router - Credit Card Minimum Payment & Payoff Calculator
 *
 * Purpose:
 * - Estimate required monthly minimum payments on unsecured credit card balances.
 * - Estimate payoff time in months assuming the card is no longer used.
 * - Model how long minimum-payment payoff may take at a default APR of 25%.
 *
 * Important assumptions:
 * - Default APR is 25%.
 * - Card is no longer being used.
 * - Balance is not increasing from new purchases, cash advances, late fees, over-limit fees, or penalty APR.
 * - If the consumer continues using the card, misses payments, pays late, or gets hit with fees/penalty APR,
 *   payoff time can become significantly longer than this calculator shows.
 *
 * Practical sales/underwriting note:
 * - Many credit card minimums commonly fall around 1% to 4% of the balance depending on creditor terms.
 * - A practical estimate for minimum-payment pressure is often 2% to 3% of the total card balance monthly.
 * - Many issuers calculate minimums as a flat floor OR a formula such as interest + 1% of balance.
 * - This file supports both simple percentage estimates and interest-plus-principal formulas.
 */

export const CREDIT_CARD_DEFAULTS = Object.freeze({
  DEFAULT_APR: 0.25,
  DEFAULT_MINIMUM_PAYMENT_RATE: 0.025,
  DEFAULT_PRINCIPAL_PAYMENT_RATE: 0.01,
  DEFAULT_FLAT_MINIMUM_PAYMENT: 35,
  DEFAULT_MONTHLY_FEES: 0,
  MAX_PAYOFF_MONTHS: 1200,
});

/**
 * Round money to cents.
 * @param {number} value
 * @returns {number}
 */
export function roundMoney(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

/**
 * Safely normalize a rate. Allows either 25 or 0.25.
 * @param {number} apr
 * @returns {number}
 */
export function normalizeApr(apr = CREDIT_CARD_DEFAULTS.DEFAULT_APR) {
  const n = Number(apr);
  if (!Number.isFinite(n) || n < 0) return CREDIT_CARD_DEFAULTS.DEFAULT_APR;
  return n > 1 ? n / 100 : n;
}

/**
 * Estimate minimum payment using a simple percent-of-balance model.
 * Example: $20,000 balance * 2.5% = $500/month.
 *
 * @param {number} balance
 * @param {object} options
 * @param {number} [options.minimumPaymentRate=0.025] - 2.5% default. Use 0.02 for 2%, 0.03 for 3%.
 * @param {number} [options.flatMinimumPayment=35]
 * @returns {number}
 */
export function estimatePercentMinimumPayment(balance, options = {}) {
  const b = Math.max(0, Number(balance) || 0);
  const minimumPaymentRate = Number(options.minimumPaymentRate ?? CREDIT_CARD_DEFAULTS.DEFAULT_MINIMUM_PAYMENT_RATE);
  const flatMinimumPayment = Number(options.flatMinimumPayment ?? CREDIT_CARD_DEFAULTS.DEFAULT_FLAT_MINIMUM_PAYMENT);

  if (b <= 0) return 0;

  return roundMoney(Math.min(b, Math.max(flatMinimumPayment, b * minimumPaymentRate)));
}

/**
 * Estimate minimum payment using an interest + principal formula.
 * This is commonly closer to how many issuers calculate minimum payments.
 * Example formula: current monthly interest + 1% of balance + fees, with a $35 floor.
 *
 * @param {number} balance
 * @param {object} options
 * @param {number} [options.apr=0.25]
 * @param {number} [options.principalPaymentRate=0.01] - 1% principal portion default.
 * @param {number} [options.flatMinimumPayment=35]
 * @param {number} [options.monthlyFees=0]
 * @returns {number}
 */
export function estimateInterestPlusPrincipalMinimumPayment(balance, options = {}) {
  const b = Math.max(0, Number(balance) || 0);
  const apr = normalizeApr(options.apr ?? CREDIT_CARD_DEFAULTS.DEFAULT_APR);
  const monthlyRate = apr / 12;
  const principalPaymentRate = Number(options.principalPaymentRate ?? CREDIT_CARD_DEFAULTS.DEFAULT_PRINCIPAL_PAYMENT_RATE);
  const flatMinimumPayment = Number(options.flatMinimumPayment ?? CREDIT_CARD_DEFAULTS.DEFAULT_FLAT_MINIMUM_PAYMENT);
  const monthlyFees = Number(options.monthlyFees ?? CREDIT_CARD_DEFAULTS.DEFAULT_MONTHLY_FEES);

  if (b <= 0) return 0;

  const monthlyInterest = b * monthlyRate;
  const formulaPayment = monthlyInterest + (b * principalPaymentRate) + monthlyFees;
  return roundMoney(Math.min(b + monthlyInterest + monthlyFees, Math.max(flatMinimumPayment, formulaPayment)));
}

/**
 * Return a practical minimum payment range for sales/underwriting display.
 *
 * @param {number} balance
 * @returns {{low:number, standard:number, high:number, aggressive:number}}
 */
export function estimateMinimumPaymentRange(balance) {
  const b = Math.max(0, Number(balance) || 0);

  return {
    low: estimatePercentMinimumPayment(b, { minimumPaymentRate: 0.02 }),
    standard: estimatePercentMinimumPayment(b, { minimumPaymentRate: 0.025 }),
    high: estimatePercentMinimumPayment(b, { minimumPaymentRate: 0.03 }),
    aggressive: estimatePercentMinimumPayment(b, { minimumPaymentRate: 0.04 }),
  };
}

/**
 * Simulate payoff month-by-month.
 *
 * Supported payment modes:
 * - fixed: user pays the same fixedMonthlyPayment until paid off.
 * - percent: payment recalculates monthly as percent of current balance with a flat floor.
 * - interestPlusPrincipal: payment recalculates monthly as interest + principal percent + fees with a flat floor.
 *
 * @param {object} input
 * @param {number} input.balance
 * @param {number} [input.apr=0.25]
 * @param {'fixed'|'percent'|'interestPlusPrincipal'} [input.paymentMode='interestPlusPrincipal']
 * @param {number} [input.fixedMonthlyPayment]
 * @param {number} [input.minimumPaymentRate=0.025]
 * @param {number} [input.principalPaymentRate=0.01]
 * @param {number} [input.flatMinimumPayment=35]
 * @param {number} [input.monthlyFees=0]
 * @param {number} [input.monthlyNewCharges=0] - Should normally be 0. If greater than 0, payoff takes longer.
 * @param {number} [input.maxMonths=1200]
 * @returns {{
 *   months:number|null,
 *   years:number|null,
 *   originalBalance:number,
 *   apr:number,
 *   monthlyRate:number,
 *   paymentMode:string,
 *   firstPayment:number,
 *   lastPayment:number,
 *   totalPaid:number,
 *   totalInterest:number,
 *   totalFees:number,
 *   totalNewCharges:number,
 *   finalBalance:number,
 *   paidOff:boolean,
 *   warnings:string[],
 *   schedule:Array<{month:number, startingBalance:number, interest:number, fees:number, newCharges:number, payment:number, endingBalance:number}>
 * }}
 */
export function calculateCreditCardPayoff(input = {}) {
  const originalBalance = roundMoney(Math.max(0, Number(input.balance) || 0));
  const apr = normalizeApr(input.apr ?? CREDIT_CARD_DEFAULTS.DEFAULT_APR);
  const monthlyRate = apr / 12;
  const paymentMode = input.paymentMode || 'interestPlusPrincipal';
  const fixedMonthlyPayment = Number(input.fixedMonthlyPayment || 0);
  const minimumPaymentRate = Number(input.minimumPaymentRate ?? CREDIT_CARD_DEFAULTS.DEFAULT_MINIMUM_PAYMENT_RATE);
  const principalPaymentRate = Number(input.principalPaymentRate ?? CREDIT_CARD_DEFAULTS.DEFAULT_PRINCIPAL_PAYMENT_RATE);
  const flatMinimumPayment = Number(input.flatMinimumPayment ?? CREDIT_CARD_DEFAULTS.DEFAULT_FLAT_MINIMUM_PAYMENT);
  const monthlyFees = Number(input.monthlyFees ?? CREDIT_CARD_DEFAULTS.DEFAULT_MONTHLY_FEES);
  const monthlyNewCharges = Number(input.monthlyNewCharges ?? 0);
  const maxMonths = Number(input.maxMonths ?? CREDIT_CARD_DEFAULTS.MAX_PAYOFF_MONTHS);

  const warnings = [];
  const schedule = [];

  if (originalBalance <= 0) {
    return {
      months: 0,
      years: 0,
      originalBalance,
      apr,
      monthlyRate,
      paymentMode,
      firstPayment: 0,
      lastPayment: 0,
      totalPaid: 0,
      totalInterest: 0,
      totalFees: 0,
      totalNewCharges: 0,
      finalBalance: 0,
      paidOff: true,
      warnings: ['Balance is zero or invalid.'],
      schedule,
    };
  }

  if (monthlyNewCharges > 0) {
    warnings.push('Monthly new charges are greater than zero. If the card continues being used, payoff time can become significantly longer.');
  }

  if (monthlyFees > 0) {
    warnings.push('Monthly fees are included. Late fees, over-limit fees, penalty APR, or missed payments can make payoff take longer.');
  }

  let balance = originalBalance;
  let totalPaid = 0;
  let totalInterest = 0;
  let totalFees = 0;
  let totalNewCharges = 0;
  let firstPayment = 0;
  let lastPayment = 0;

  for (let month = 1; month <= maxMonths; month++) {
    const startingBalance = roundMoney(balance);
    const interest = roundMoney(startingBalance * monthlyRate);
    const fees = roundMoney(monthlyFees);
    const newCharges = roundMoney(monthlyNewCharges);
    const balanceBeforePayment = roundMoney(startingBalance + interest + fees + newCharges);

    let payment;

    if (paymentMode === 'fixed') {
      payment = fixedMonthlyPayment;
    } else if (paymentMode === 'percent') {
      payment = estimatePercentMinimumPayment(startingBalance, {
        minimumPaymentRate,
        flatMinimumPayment,
      });
    } else {
      payment = estimateInterestPlusPrincipalMinimumPayment(startingBalance, {
        apr,
        principalPaymentRate,
        flatMinimumPayment,
        monthlyFees,
      });
    }

    payment = roundMoney(Math.min(balanceBeforePayment, Math.max(0, payment)));

    if (payment <= interest + fees + newCharges && balanceBeforePayment > payment) {
      warnings.push('Payment does not cover interest, fees, and/or new charges. Balance may not amortize.');
      return buildPayoffResult({
        months: null,
        originalBalance,
        apr,
        monthlyRate,
        paymentMode,
        firstPayment,
        lastPayment,
        totalPaid,
        totalInterest,
        totalFees,
        totalNewCharges,
        finalBalance: balanceBeforePayment,
        paidOff: false,
        warnings,
        schedule,
      });
    }

    if (month === 1) firstPayment = payment;
    lastPayment = payment;

    const endingBalance = roundMoney(balanceBeforePayment - payment);

    schedule.push({
      month,
      startingBalance,
      interest,
      fees,
      newCharges,
      payment,
      endingBalance,
    });

    totalPaid = roundMoney(totalPaid + payment);
    totalInterest = roundMoney(totalInterest + interest);
    totalFees = roundMoney(totalFees + fees);
    totalNewCharges = roundMoney(totalNewCharges + newCharges);
    balance = endingBalance;

    if (balance <= 0.005) {
      return buildPayoffResult({
        months: month,
        originalBalance,
        apr,
        monthlyRate,
        paymentMode,
        firstPayment,
        lastPayment,
        totalPaid,
        totalInterest,
        totalFees,
        totalNewCharges,
        finalBalance: 0,
        paidOff: true,
        warnings,
        schedule,
      });
    }
  }

  warnings.push(`Balance did not pay off within ${maxMonths} months. Payment may be too low or new charges/fees may be too high.`);

  return buildPayoffResult({
    months: null,
    originalBalance,
    apr,
    monthlyRate,
    paymentMode,
    firstPayment,
    lastPayment,
    totalPaid,
    totalInterest,
    totalFees,
    totalNewCharges,
    finalBalance: balance,
    paidOff: false,
    warnings,
    schedule,
  });
}

function buildPayoffResult(result) {
  return {
    ...result,
    years: result.months === null ? null : roundMoney(result.months / 12),
    totalPaid: roundMoney(result.totalPaid),
    totalInterest: roundMoney(result.totalInterest),
    totalFees: roundMoney(result.totalFees),
    totalNewCharges: roundMoney(result.totalNewCharges),
    finalBalance: roundMoney(result.finalBalance),
    firstPayment: roundMoney(result.firstPayment),
    lastPayment: roundMoney(result.lastPayment),
  };
}

/**
 * Convenience function for Deal Router cards.
 * Produces a compact summary for the UI without exposing the full schedule.
 *
 * @param {number} balance
 * @param {object} options
 * @returns {{
 *   balance:number,
 *   apr:number,
 *   minimumPaymentRange:{low:number,standard:number,high:number,aggressive:number},
 *   payoffEstimate:{months:number|null,years:number|null,totalPaid:number,totalInterest:number,firstPayment:number,lastPayment:number,paidOff:boolean,warnings:string[]},
 *   disclaimer:string
 * }}
 */
export function buildCreditCardDebtSummary(balance, options = {}) {
  const apr = normalizeApr(options.apr ?? CREDIT_CARD_DEFAULTS.DEFAULT_APR);
  const payoff = calculateCreditCardPayoff({
    balance,
    apr,
    paymentMode: options.paymentMode || 'interestPlusPrincipal',
    principalPaymentRate: options.principalPaymentRate ?? CREDIT_CARD_DEFAULTS.DEFAULT_PRINCIPAL_PAYMENT_RATE,
    minimumPaymentRate: options.minimumPaymentRate ?? CREDIT_CARD_DEFAULTS.DEFAULT_MINIMUM_PAYMENT_RATE,
    flatMinimumPayment: options.flatMinimumPayment ?? CREDIT_CARD_DEFAULTS.DEFAULT_FLAT_MINIMUM_PAYMENT,
    monthlyFees: options.monthlyFees ?? 0,
    monthlyNewCharges: options.monthlyNewCharges ?? 0,
  });

  return {
    balance: roundMoney(Number(balance) || 0),
    apr,
    minimumPaymentRange: estimateMinimumPaymentRange(balance),
    payoffEstimate: {
      months: payoff.months,
      years: payoff.years,
      totalPaid: payoff.totalPaid,
      totalInterest: payoff.totalInterest,
      firstPayment: payoff.firstPayment,
      lastPayment: payoff.lastPayment,
      paidOff: payoff.paidOff,
      warnings: payoff.warnings,
    },
    disclaimer:
      'Estimate assumes 25% APR by default, no new card usage, no late payments, no extra fees, no penalty APR, and consistent payments. If the card continues being used, payments are late, or fees/penalty APR apply, payoff time can be longer.',
  };
}

export default {
  CREDIT_CARD_DEFAULTS,
  roundMoney,
  normalizeApr,
  estimatePercentMinimumPayment,
  estimateInterestPlusPrincipalMinimumPayment,
  estimateMinimumPaymentRange,
  calculateCreditCardPayoff,
  buildCreditCardDebtSummary,
};
