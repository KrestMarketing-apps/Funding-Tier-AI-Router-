export const compliance = {
  requiredDisclosures: [
    "Law firm cannot stop all creditor calls.",
    "Client decides whether to stop paying creditors.",
    "Client may still be sued.",
    "Program may negatively impact credit."
  ],

  prohibitedPhrases: [
    "guarantee",
    "erase your debt",
    "cannot be sued",
    "credit repair",
    "pre-approved",
    "we are attorneys"
  ],

  approvedPhrases: [
    "may help resolve accounts",
    "results vary",
    "law firm will review",
    "not a loan",
    "not credit repair"
  ],

  openingTemplate:
    "Based on your situation, we may have a legal service program that could help address your accounts, but before I explain it, I need your permission to go over those details. Are you okay hearing more?",

  checkText(text) {
    const normalized = String(text || "").toLowerCase();

    const violations = this.prohibitedPhrases.filter((phrase) =>
      normalized.includes(phrase.toLowerCase())
    );

    return {
      compliant: violations.length === 0,
      violations
    };
  }
};
