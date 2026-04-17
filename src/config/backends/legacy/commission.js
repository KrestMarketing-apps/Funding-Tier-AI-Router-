export const commission = {
  billable: {
    tier1: { minFiles: 1, maxFiles: 99, rate: 0.60 },
    tier2: { minFiles: 100, maxFiles: Infinity, rate: 0.65 }
  },

  accelerated: {
    eligibleTermMonths: 18,
    months1to7: 0.9,
    months8to24: 0.25
  },

  getTierRate(monthlyFiles) {
    if (monthlyFiles >= 100) return this.billable.tier2.rate;
    if (monthlyFiles >= 1) return this.billable.tier1.rate;
    return 0;
  },

  calculateBillable({
    mmp,
    monthlyFiles,
    maintenanceFee = 0,
    returnsOrRefunds = 0,
    processingFees = 0,
    draftingFees = 0,
    softwareFees = 0
  }) {
    const tierRate = this.getTierRate(Number(monthlyFiles || 0));
    const basis =
      Number(mmp || 0) -
      Number(maintenanceFee || 0) -
      Number(returnsOrRefunds || 0) -
      Number(processingFees || 0) -
      Number(draftingFees || 0) -
      Number(softwareFees || 0);

    return Math.max(0, basis) * tierRate;
  },

  calculateAccelerated({ mmp, month }) {
    const safeMmp = Number(mmp || 0);
    const safeMonth = Number(month || 0);

    if (safeMonth >= 1 && safeMonth <= 7) return safeMmp * this.accelerated.months1to7;
    if (safeMonth >= 8 && safeMonth <= 24) return safeMmp * this.accelerated.months8to24;
    return 0;
  }
};
