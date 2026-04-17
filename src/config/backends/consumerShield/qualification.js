export const qualification = {
  minDebt: 4000,
  maxDebtForPriorityRouting: 5999,
  minAccountBalance: 100,

  isQualified(lead) {
    return (
      Number(lead?.totalDebt || 0) >= this.minDebt &&
      lead?.stateEligible !== false
    );
  },

  getFailures(lead) {
    const failures = [];

    if (Number(lead?.totalDebt || 0) < this.minDebt) {
      failures.push("LOW_DEBT");
    }

    if (lead?.stateEligible === false) {
      failures.push("STATE_BLOCKED");
    }

    return failures;
  }
};
