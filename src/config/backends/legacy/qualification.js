export const qualification = {
  minDebt: 6000,
  minMonthlyPayment: 250,
  minAccountBalance: 100,

  isQualified(lead) {
    return (
      Number(lead?.totalDebt || 0) >= this.minDebt &&
      Number(lead?.monthlyPayment || 0) >= this.minMonthlyPayment &&
      lead?.bankVerified === true
    );
  },

  getFailures(lead) {
    const failures = [];

    if (Number(lead?.totalDebt || 0) < this.minDebt) {
      failures.push("LOW_DEBT");
    }

    if (Number(lead?.monthlyPayment || 0) < this.minMonthlyPayment) {
      failures.push("LOW_PAYMENT");
    }

    if (lead?.bankVerified !== true) {
      failures.push("BANK_NOT_VERIFIED");
    }

    return failures;
  }
};
