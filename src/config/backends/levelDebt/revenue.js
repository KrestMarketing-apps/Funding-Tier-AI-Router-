export const revenue = {
  name: "Level Debt Revenue Model",

  // 🔥 THIS IS WHAT YOU ACTUALLY GET PAID
  companyPayoutRate: 0.08, // 8%

  // Program fee (for UI reference only — NOT your revenue)
  standardProgramFee: 0.25,
  attorneyProgramFee: 0.27,

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

  getMonthlyPayment(totalDebt, state, routing) {
    const debt = Number(totalDebt || 0);
    const termMonths = this.getMaxTerm(debt);
    const programFee = this.getProgramFee(state, routing);

    const totalCost = (debt * 0.5) + (debt * programFee);
    return totalCost / termMonths;
  },

  calculate({ totalDebt, state, routing }) {
    const debt = Number(totalDebt || 0);

    const programFee = this.getProgramFee(state, routing);
    const termMonths = this.getMaxTerm(debt);

    // 🔹 Program economics (what client pays)
    const estimatedSettlement = debt * 0.5;
    const programFees = debt * programFee;
    const totalProgramCost = estimatedSettlement + programFees;

    // 🔥 YOUR ACTUAL REVENUE
    const companyRevenue = debt * this.companyPayoutRate;

    const monthlyPayment = totalProgramCost / termMonths;

    return {
      eligible: debt >= 7000,

      totalDebt: debt,
      termMonths,

      // Client-facing (UI)
      estimatedSettlement,
      programFees,
      totalProgramCost,
      monthlyPayment,

      // 🔥 INTERNAL ONLY
      totalRevenue: companyRevenue,
      revenueRate: this.companyPayoutRate,

      // helpful for comparisons
      backend: "LEVEL_DEBT"
    };
  }
};
