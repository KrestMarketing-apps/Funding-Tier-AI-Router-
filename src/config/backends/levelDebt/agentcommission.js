export const agentcommission = {
  name: "Level Debt Agent Commission",

  tiers: [
    { tier: 1, minVolume: 0, maxVolume: 999999, rate: 0.01, label: "1.00%" },
    { tier: 2, minVolume: 1000000, maxVolume: 1999999, rate: 0.0115, label: "1.15%" },
    { tier: 3, minVolume: 2000000, maxVolume: Infinity, rate: 0.013, label: "1.30%" }
  ],

  getTier(monthlyVolume) {
    const volume = Number(monthlyVolume || 0);
    return this.tiers.find((t) => volume >= t.minVolume && volume <= t.maxVolume) || this.tiers[0];
  },

  calculate(enrolledDebt, monthlyVolume) {
    const debt = Number(enrolledDebt || 0);
    const tier = this.getTier(monthlyVolume);

    return {
      tier: tier.tier,
      rate: tier.rate,
      label: tier.label,
      estimatedCommission: debt * tier.rate,
      payoutTiming: "Paid on the 20th of Month 3 after 2 program payments clear"
    };
  },

  getClawbackPolicy() {
    return "Chargeback may apply if the client cancels before 3 payments clear.";
  }
};
