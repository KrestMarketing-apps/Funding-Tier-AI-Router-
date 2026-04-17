export const revenue = {
  name: "Level Debt Revenue Model",

  // 🔥 What Funding Tier earns
  companyPayoutRate: 0.08, // 8%

  // Program fee (client-facing, NOT your revenue)
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

    const estimatedSettlement = debt * 0.5;
    const programFees = debt * programFee;
    const totalProgramCost = estimatedSettlement + programFees;

    return totalProgramCost / termMonths;
  },

  calculate({ totalDebt, state, routing }) {
    const debt = Number(totalDebt || 0);

    const programFee = this.getProgramFee(state, routing);
    const termMonths = this.getMaxTerm(debt);

    // 🔹 Client-facing math
    const estimatedSettlement = debt * 0.5;
    const programFees = debt * programFee;
    const totalProgramCost = estimatedSettlement + programFees;
    const monthlyPayment = totalProgramCost / termMonths;

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
      monthlyPayment,

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
