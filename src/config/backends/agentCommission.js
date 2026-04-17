export const agentCommission = {
  name: "Consumer Shield Agent Commission",

  programs: [
    { code: "A", min: 4000, max: 4999, monthlyPayment: 220, term: 18, total: 150, p2: 150, p4: 0 },
    { code: "B", min: 5000, max: 8799, monthlyPayment: 220, term: 24, total: 150, p2: 150, p4: 0 },
    { code: "C", min: 8800, max: 9999, monthlyPayment: 220, term: 36, total: 150, p2: 150, p4: 0 },
    { code: "D", min: 10000, max: 14999, monthlyPayment: 270, term: 36, total: 225, p2: 175, p4: 50 },
    { code: "E", min: 15000, max: 19999, monthlyPayment: 320, term: 36, total: 275, p2: 200, p4: 75 },
    { code: "F", min: 20000, max: 24999, monthlyPayment: 370, term: 36, total: 350, p2: 250, p4: 100 },
    { code: "G", min: 25000, max: 29999, monthlyPayment: 420, term: 36, total: 400, p2: 300, p4: 100 },
    { code: "H", min: 30000, max: 49999, monthlyPayment: 520, term: 36, total: 500, p2: 375, p4: 125 },
    { code: "I", min: 50000, max: Infinity, monthlyPayment: 620, term: 36, total: 600, p2: 450, p4: 150 }
  ],

  // 🔍 Get program based on total enrolled debt
  getProgram(totalDebt) {
    const debt = Number(totalDebt || 0);
    return this.programs.find(p => debt >= p.min && debt <= p.max) || null;
  },

  // 💰 Get full payout breakdown
  getPayout(totalDebt) {
    const program = this.getProgram(totalDebt);
    if (!program) return null;

    return {
      program: program.code,
      totalCommission: program.total,
      payments: [
        {
          stage: "Payment 2",
          amount: program.p2,
          payoutTiming: "Paid on the 20th of Month 3"
        },
        program.p4 > 0 && {
          stage: "Payment 4",
          amount: program.p4,
          payoutTiming: "Paid on the 20th of Month 5"
        }
      ].filter(Boolean)
    };
  },

  // ⚠️ Clawback logic (important for backend logic)
  getClawbackPolicy(programCode) {
    const prog = this.programs.find(p => p.code === programCode);
    if (!prog) return null;

    if (prog.p4 > 0) {
      return "P2 commission subject to clawback if client cancels before Payment 4 within 60 days.";
    }

    return "No split payout. Commission paid after Payment 2 clears.";
  },

  // 🎯 Daily bonus logic
  getDailyBonus(dealsClosedToday) {
    if (dealsClosedToday >= 5) return 75;
    if (dealsClosedToday >= 3) return 50;
    return 0;
  },

  // 📈 Monthly bonus tiers
  getMonthlyBonus(dealsClosed) {
    if (dealsClosed >= 30) return 2250;
    if (dealsClosed >= 23) return 1500;
    if (dealsClosed >= 17) return 1000;
    if (dealsClosed >= 12) return 600;
    if (dealsClosed >= 8) return 300;
    return 0;
  },

  // ⚖️ Balanced book bonus (LD vs CS mix)
  getBalancedBookBonus(totalDeals, csPercentage) {
    if (totalDeals < 5) return 0;

    if (csPercentage >= 0.7) return 500;
    if (csPercentage >= 0.5) return 250;
    if (csPercentage >= 0.3) return 100;

    return 0;
  }
};
