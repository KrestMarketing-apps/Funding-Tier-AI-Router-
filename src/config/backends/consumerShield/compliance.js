export const compliance = {
  requiredDisclosures: [
    "Consumer Shield is a debt validation program, not debt settlement.",
    "Program results vary depending on the account and creditor response.",
    "Not all debts qualify.",
    "No specific outcome can be guaranteed."
  ],

  prohibitedPhrases: [
    "guarantee",
    "erase your debt",
    "we will remove it",
    "instant removal",
    "this fixes your credit"
  ],

  approvedPhrases: [
    "debt validation",
    "results vary",
    "not all debts qualify",
    "fixed monthly structure",
    "legal challenge process"
  ],

  openingTemplate:
    "Based on what you shared, you may fit a debt validation program with a fixed monthly structure. Let me walk you through how it works.",

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
