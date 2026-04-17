export const revenue = {
  servicingDeductionPerPayment: 40,
  frontMonths: 4,
  frontCaptureRate: 1.0,
  backendCaptureRate: 0.35,

  programs: [
    { code: "A", min: 4000, max: 4999, monthlyPayment: 220, term: 18 },
    { code: "B", min: 5000, max: 8799, monthlyPayment: 220, term: 24 },
    { code: "C", min: 8800, max: 9999, monthlyPayment: 220, term: 36 },
    { code: "D", min: 10000, max: 14999, monthlyPayment: 270, term: 36 },
    { code: "E", min: 15000, max: 19999, monthlyPayment: 320, term: 36 },
    { code: "F", min: 20000, max: 24999, monthlyPayment: 370, term: 36 },
    { code: "G", min: 25000, max: 29999, monthlyPayment: 420, term: 36 },
    { code: "H", min: 30000, max: 49999, monthlyPayment: 520, term: 36 },
    { code: "I", min: 50000, max: Infinity, monthlyPayment: 620, term: 36 }
  ],

  getProgram(totalDebt) {
    const debt = Number(totalDebt || 0);
    return this.programs.find(p => debt >= p.min && debt <= p.max) || null;
  },

  getNetPayment(totalDebt) {
    const program = this.getProgram(totalDebt);
    if (!program) return null;
    return Math.max(0, program.monthlyPayment - this.servicingDeductionPerPayment);
  },

  getProjectedRevenue(totalDebt) {
    const program = this.getProgram(totalDebt);
    if (!program) return null;

    const net = this.getNetPayment(totalDebt);
    const frontMonths = Math.min(this.frontMonths, program.term);
    const backendMonths = Math.max(0, program.term - frontMonths);

    const frontRevenue = net * frontMonths * this.frontCaptureRate;
    const backendRevenue = net * backendMonths * this.backendCaptureRate;

    return {
      program: program.code,
      monthlyPayment: program.monthlyPayment,
      netPayment: net,
      term: program.term,
      frontRevenue,
      backendRevenue,
      totalProjectedRevenue: frontRevenue + backendRevenue
    };
  }
};
