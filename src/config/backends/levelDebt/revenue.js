export const revenue = {
  name: "Level Debt Revenue Model",

  // 🔥 What Funding Tier earns
  companyPayoutRate: 0.08, // 8%

  // ── Client-facing program math ───────────────────────────────────────────
  // Reproduces the Forth enrollment schedule exactly. Verified against a live
  // plan ($10,000 enrolled, California, 30 months, 25% success fee, 50% est
  // settlement): total fees $2,839.45, program cost $7,839.45, client savings
  // $2,160.55, payment $261.32, month 1 savings $156.09, $167.04 thereafter.
  //
  //   program cost = (debt x settlement%) + (debt x success fee%)
  //                  + (gateway monthly x term) + gateway setup
  //   payment      = program cost / term      <- the SAME every month
  //
  // The setup fee is inside the program cost, already spread across the term.
  // It does not raise month 1; it takes $10.95 out of month 1's savings.

  standardSuccessFee: 0.25,
  attorneySuccessFee: 0.27,
  defaultSettlementPct: 0.5,

  gatewayFeeMonthly: 10.95,
  gatewaySetupFee: 10.95,
  splitSurchargePerPayment: 0.515,

  // NOT on the standard Forth debt settlement plan — the live schedule's total
  // fees reconcile exactly without it. Zero until it is confirmed which plans
  // carry a monthly legal fee.
  legalFeeMonthly: 0,

  firstSettlementMilestoneMonth: 6,

  getSuccessFeeRate(state, routing) {
    if (routing?.isAttorneyModelState?.(state)) return this.attorneySuccessFee;
    return this.standardSuccessFee;
  },

  /** Kept for callers that still ask for a "program fee". */
  getProgramFee(state, routing) {
    return this.getSuccessFeeRate(state, routing);
  },

  getMaxTerm(totalDebt) {
    const debt = Number(totalDebt || 0);
    if (debt < 10000) return 24;
    if (debt < 12500) return 30;
    if (debt < 15000) return 36;
    if (debt < 25000) return 42;
    if (debt < 35000) return 48;
    if (debt < 50000) return 54;
    return 60;
  },

  /** Full plan breakdown, column for column as Forth renders it. */
  getPlan(totalDebt, state, routing, opts) {
    const o = opts || {};
    const debt = Number(totalDebt || 0);
    const term = Math.max(1, Number(o.term || this.getMaxTerm(debt)));
    const successFeeRate = this.getSuccessFeeRate(state, routing);
    const settlementPct = o.settlementPct != null ? o.settlementPct : this.defaultSettlementPct;
    const split = !!o.split;
    const splitSurcharge = split ? this.splitSurchargePerPayment * 2 : 0;

    const settlementTarget = debt * settlementPct;
    const successFeeTotal = debt * successFeeRate;
    const gatewayTotal = this.gatewayFeeMonthly * term + this.gatewaySetupFee;
    const legalTotal = (this.legalFeeMonthly + splitSurcharge) * term;

    // Forth rounds the draft and the success-fee line to cents, then derives
    // savings from the rounded figures. Rounding at the end instead leaves
    // every savings row a cent light.
    const r2 = (n) => Math.round(n * 100) / 100;

    const totalFees = r2(successFeeTotal + gatewayTotal + legalTotal);
    const totalProgramCost = r2(settlementTarget + totalFees);
    const monthlyPayment = r2(totalProgramCost / term);

    return {
      term, successFeeRate, settlementPct,
      settlementTarget: r2(settlementTarget), successFeeTotal: r2(successFeeTotal),
      successFeeMonthly: r2(successFeeTotal / term),
      gatewayMonthly: this.gatewayFeeMonthly,
      gatewaySetup: this.gatewaySetupFee,
      legalFeeMonthly: this.legalFeeMonthly,
      splitSurcharge,
      totalFees, totalProgramCost,
      estClientSavings: r2(debt - totalProgramCost),
      monthlyPayment,
      perDraft: split ? r2(monthlyPayment / 2) : null,
      splitPayments: split,
    };
  },

  /** What actually leaves the client's account — the same every month. */
  getMonthlyPayment(totalDebt, state, routing, opts) {
    return this.getPlan(totalDebt, state, routing, opts).monthlyPayment;
  },

  /**
   * The payment schedule. Savings is the remainder after each month's fees,
   * which is why month 1 is lighter by the setup fee while the draft is not.
   */
  getSchedule(totalDebt, state, routing, opts) {
    const plan = this.getPlan(totalDebt, state, routing, opts);
    const months = Math.min((opts && opts.months) || plan.term, plan.term);
    const rows = [];
    let cumulativeSavings = 0;
    for (let month = 1; month <= months; month++) {
      const gatewaySetup = month === 1 ? plan.gatewaySetup : 0;
      const legalFee = plan.legalFeeMonthly + plan.splitSurcharge;
      const savings = Math.round((plan.monthlyPayment - plan.successFeeMonthly
        - plan.gatewayMonthly - gatewaySetup - legalFee) * 100) / 100;
      cumulativeSavings = Math.round((cumulativeSavings + savings) * 100) / 100;
      rows.push({
        month, successFee: plan.successFeeMonthly, gatewaySetup,
        gatewayMonthly: plan.gatewayMonthly, legalFee,
        savings, cumulativeSavings, totalPayment: plan.monthlyPayment,
      });
    }
    return rows;
  },

  calculate({ totalDebt, state, routing, term, settlementPct, split }) {
    const debt = Number(totalDebt || 0);
    const plan = this.getPlan(debt, state, routing, { term, settlementPct, split });

    return {
      eligible: debt >= 7000,
      totalDebt: debt,
      termMonths: plan.term,

      // Client-facing values
      estimatedSettlement: plan.settlementTarget,
      successFeeTotal: plan.successFeeTotal,
      totalFees: plan.totalFees,
      totalProgramCost: plan.totalProgramCost,
      estClientSavings: plan.estClientSavings,
      monthlyPayment: plan.monthlyPayment,
      perDraft: plan.perDraft,
      splitPayments: plan.splitPayments,

      // Internal values (DO NOT expose to agents)
      totalRevenue: debt * this.companyPayoutRate,
      revenueRate: this.companyPayoutRate,

      backend: "LEVEL_DEBT"
    };
  },

  // 🔥 Revenue spread across time (used for smarter routing decisions)
  getRevenuePerMonth(totalDebt, termMonths) {
    const debt = Number(totalDebt || 0);
    const months = Number(termMonths || 1);

    const totalRevenue = debt * this.companyPayoutRate;

    return totalRevenue / months;
  }
};
