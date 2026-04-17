export const objections = {
  creditRepair:
    "This is not credit repair. It’s a legal-service-based program for creditor and collection accounts.",
  eraseDebt:
    "No one can guarantee that. Outcomes depend on your situation and creditor response.",
  creditImpact:
    "There may be a temporary negative impact on your credit.",
  lawsuit:
    "Yes, lawsuits are still possible. The program does not guarantee prevention.",
  lawFirm:
    "We are not the law firm. We help qualify and enroll. Final acceptance is determined by the law firm.",

  get(key) {
    return this[key] || null;
  }
};
