export const agentcommission = {
  name: "Legacy Capital Services Agent Commission",

  bands: [
    { code: "L1", minDebt: 6000,  maxDebt: 9999,   total: 150, p2: 150, p4: 0 },
    { code: "L2", minDebt: 10000, maxDebt: 14999,  total: 225, p2: 175, p4: 50 },
    { code: "L3", minDebt: 15000, maxDebt: 19999,  total: 275, p2: 200, p4: 75 },
    { code: "L4", minDebt: 20000, maxDebt: 24999,  total: 350, p2: 250, p4: 100 },
    { code: "L5", minDebt: 25000, maxDebt: 29999,  total: 400, p2: 300, p4: 100 },
    { code: "L6", minDebt: 30000, maxDebt: 49999,  total: 500, p2: 375, p4: 125 },
    { code: "L7", minDebt: 50000, maxDebt: Infinity, total: 600, p2: 450, p4: 150 }
  ],

  // 🔍 Find commission band
  getBand(totalDebt) {
    const debt = Number(totalDebt || 0);
    return this.bands.find(b => debt >= b.minDebt && debt <= b.maxDebt) || null;
  },

  // 💰 Get payout structure
  getPayout(totalDebt) {
    const band = this.getBand(totalDebt);
    if (!band) return null;

    return {
      band: band.code,
      totalcommission: band.total,
      payments: [
        {
          stage: "payment_2",
          amount: band.p2,
          timing: "after payment 2 clears"
        },
        ...(band.p4 > 0
          ? [
              {
                stage: "payment_4",
                amount: band.p4,
                timing: "after payment 4 clears"
              }
            ]
          : [])
      ]
    };
  },

  // ⚠️ Clawback rules
  getClawbackPolicy(totalDebt) {
    const band = this.getBand(totalDebt);
    if (!band) return null;

    if (band.p4 > 0) {
      return "payment 2 commission may be clawed back if the client cancels before payment 4 clears";
    }

    return "single payout after payment 2 clears";
  },

  // 🔥 Daily bonus (optional use)
  getDailyBonus(dealsClosedToday) {
    const deals = Number(dealsClosedToday || 0);

    if (deals >= 5) return 75;
    if (deals >= 3) return 50;
    return 0;
  },

  // 📈 Monthly bonus (optional use)
  getMonthlyBonus(dealsClosed) {
    const deals = Number(dealsClosed || 0);

    if (deals >= 30) return 2250;
    if (deals >= 23) return 1500;
    if (deals >= 17) return 1000;
    if (deals >= 12) return 600;
    if (deals >= 8) return 300;
    return 0;
  },

  // ⚖️ Balanced book bonus
  getBalancedBookBonus(totalDeals, csPercentage) {
    const deals = Number(totalDeals || 0);
    const pct = Number(csPercentage || 0);

    if (deals < 5) return 0;

    if (pct >= 0.7) return 500;
    if (pct >= 0.5) return 250;
    if (pct >= 0.3) return 100;

    return 0;
  }
};
