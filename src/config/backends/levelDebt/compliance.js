export const compliance = {
  requiredDisclosures: [
    "Level Debt is a debt settlement program, not debt validation.",
    "Settlement results vary by creditor and by file.",
    "Debt settlement may negatively impact credit.",
    "Not all debt types, creditors, or states qualify."
  ],

  prohibitedPhrases: [
    "guarantee savings",
    "we will eliminate your debt",
    "your credit will improve",
    "you cannot be sued",
    "instant approval",
    "guaranteed settlement"
  ],

  approvedPhrases: [
    "debt settlement",
    "results vary",
    "may negatively impact credit",
    "not all debts qualify",
    "creditor response varies",
    "attorney model in some states"
  ],

  openingTemplate:
    "Based on what you shared, you may fit a debt settlement program focused on resolving balances over time. Let me explain how it works.",

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
