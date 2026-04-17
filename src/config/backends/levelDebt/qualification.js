export const qualification = {
  minDebt: 7000,
  minPerAccount: 200,

  isQualified(lead) {
    return Number(lead?.totalDebt || 0) >= this.minDebt;
  },

  getFailures(lead) {
    const failures = [];

    if (Number(lead?.totalDebt || 0) < this.minDebt) {
      failures.push("LOW_DEBT");
    }

    return failures;
  }
};
