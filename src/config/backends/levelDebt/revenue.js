export const revenue = {
  name: "Level Debt Revenue Model",

  // 🔥 What Funding Tier earns
  companyPayoutRate: 0.08, // 8%

  // Program fee (client-facing, NOT your revenue)
  standardProgramFee: 0.25,
  attorneyProgramFee: 0.27,

  // ── Ancillary client fees ────────────────────────────────────────────────
  // These ride on top of the settlement deposit every month. They are what the
  // client actually pays, and none of them touch Funding Tier's 8%.
  legalFeeMonthly: 19.99,
  // Global Holdings escrow / bank account.
  gatewayFeeMonthly: 10.95,
  // Charged once, at enrollment. It does NOT make month 1 a bigger draft — the
  // client pays the same every month. It comes out of that payment, so month 1
  // simply puts less into the savings / escrow account.
  gatewaySetupFee: 10.95,
  // Semi-monthly (split) schedules draft twice; each draft carries this.
  splitSurchargePerPayment: 0.515,

  getProgramFee(state, routing) {
    if (routing?.isAttorneyModelState?.(state)) {
      return this.attorneyProgramFee;
    }
    return this.standardProgramFee;
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

  /**
   * Recurring fees taken out of every draft. Constant across the term — the
   * one-time setup fee changes what lands in savings, not what is charged.
   */
  getAncillaryFees(split) {
    return (
      this.legalFeeMonthly +
      this.gatewayFeeMonthly +
      (split ? this.splitSurchargePerPayment * 2 : 0)
    );
  },

  /** Usually the earliest point a first settlement can be attempted. */
  firstSettlementMilestoneMonth: 6,

  /**
   * Funds accumulating in the client's savings / escrow account, month by
   * month. Deposits net of the legal and gateway fees only — settlement
   * payouts and the program fee draw this down as accounts settle, so it is
   * the ceiling on funds available to settle with, not a balance forecast.
   */
  getEscrowProjection(totalDebt, state, routing, opts) {
    var o = opts || {};
    var split = !!o.split;
    var term = this.getMaxTerm(Number(totalDebt || 0));
    var months = Math.min(o.months || term, term);
    var payment = this.getMonthlyPayment(totalDebt, state, routing, { split: split });
    var recurring = this.getAncillaryFees(split);

    var rows = [];
    var cumulative = 0;
    for (var month = 1; month <= months; month++) {
      var feesTaken = recurring + (month === 1 ? this.gatewaySetupFee : 0);
      var toEscrow = payment - feesTaken;
      cumulative += toEscrow;
      rows.push({ month: month, payment: payment, feesTaken: feesTaken, toEscrow: toEscrow, cumulative: cumulative });
    }
    return rows;
  },

  /** The settlement deposit alone — this is what the $250 minimum applies to. */
  getMonthlyDeposit(totalDebt, state, routing) {
    const debt = Number(totalDebt || 0);
    const termMonths = this.getMaxTerm(debt);
    const programFee = this.getProgramFee(state, routing);

    const estimatedSettlement = debt * 0.5;
    const programFees = debt * programFee;

    return (estimatedSettlement + programFees) / termMonths;
  },

  /**
   * What actually leaves the client's account. Deposit plus the legal, gateway
   * and (on a split schedule) per-draft fees. Pass month 1 to include the
   * one-time gateway setup fee.
   */
  getMonthlyPayment(totalDebt, state, routing, opts) {
    var o = opts || {};
    return this.getMonthlyDeposit(totalDebt, state, routing) + this.getAncillaryFees(o.split);
  },

  calculate({ totalDebt, state, routing }) {
    const debt = Number(totalDebt || 0);

    const programFee = this.getProgramFee(state, routing);
    const termMonths = this.getMaxTerm(debt);

    // 🔹 Client-facing math
    const estimatedSettlement = debt * 0.5;
    const programFees = debt * programFee;
    const totalProgramCost = estimatedSettlement + programFees;

    const split = !!(routing && routing.splitPayments);
    const monthlyDeposit = totalProgramCost / termMonths;
    // Same draft every month. The one-time setup fee reduces what reaches the
    // savings account in month 1; it does not raise the payment.
    const monthlyPayment = monthlyDeposit + this.getAncillaryFees(split);

    // 🔥 YOUR ACTUAL REVENUE
    const companyRevenue = debt * this.companyPayoutRate;

    return {
      eligible: debt >= 7000,

      totalDebt: debt,
      termMonths,

      // Client-facing values
      estimatedSettlement,
      programFees,
      totalProgramCost,
      monthlyDeposit,
      monthlyPayment,
      ancillaryMonthly: this.getAncillaryFees(split),
      splitPayments: split,

      // Internal values (DO NOT expose to agents)
      totalRevenue: companyRevenue,
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
