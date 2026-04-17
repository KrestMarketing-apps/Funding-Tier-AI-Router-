export const knowledgebase = {
  summary:
    "Consumer Shield is a debt validation backend with fixed monthly payment tiers. It is best for lower-balance debt validation scenarios and for prospects who want a defined monthly payment structure instead of a settlement-style program.",

  serviceType: "Debt Validation",

  minimums: {
    totalDebt: 4000,
    priorityRoutingMaxDebt: 6000,
    minimumAccountBalance: 100
  },

  stateRules: {
    blackoutStates: ["NC", "PA", "CO", "WA", "CT", "NJ", "OR", "TX"],
    serviceableRule:
      "Consumer Shield is available in serviceable states only. If the state is blacked out, the deal cannot be routed to Consumer Shield."
  },

  programStructure: {
    description:
      "Consumer Shield uses fixed monthly payment tiers based on total enrolled debt. The payment and term are determined by the matching program band.",
    supportHours: "Monday-Friday 9am-7pm EST",
    creditPull: "Equifax"
  },

  programs: [
    { code: "A", minDebt: 4000, maxDebt: 4999, monthlyPayment: 220, term: 18 },
    { code: "B", minDebt: 5000, maxDebt: 8799, monthlyPayment: 220, term: 24 },
    { code: "C", minDebt: 8800, maxDebt: 9999, monthlyPayment: 220, term: 36 },
    { code: "D", minDebt: 10000, maxDebt: 14999, monthlyPayment: 270, term: 36 },
    { code: "E", minDebt: 15000, maxDebt: 19999, monthlyPayment: 320, term: 36 },
    { code: "F", minDebt: 20000, maxDebt: 24999, monthlyPayment: 370, term: 36 },
    { code: "G", minDebt: 25000, maxDebt: 29999, monthlyPayment: 420, term: 36 },
    { code: "H", minDebt: 30000, maxDebt: 49999, monthlyPayment: 520, term: 36 },
    { code: "I", minDebt: 50000, maxDebt: Infinity, monthlyPayment: 620, term: 36 }
  ],

  acceptedDebtTypes: [
    "Unsecured debt",
    "Unsecured Personal Loan",
    "Unsecured Line of Credit",
    "Medical Bill",
    "Payday Loan",
    "Back Rent (if in collections)"
  ],

  conditionalDebtTypes: [
    {
      type: "USAA",
      rule: "Conditional for Consumer Shield."
    },
    {
      type: "Deficiency",
      rule: "Conditional for Consumer Shield."
    },
    {
      type: "Repossession Deficiency",
      rule: "Conditional for Consumer Shield."
    },
    {
      type: "Auto Repo Deficiency",
      rule: "Conditional for Consumer Shield."
    },
    {
      type: "Tribal Loan",
      rule: "Conditional for Consumer Shield."
    },
    {
      type: "Business Debt",
      rule: "Conditional for Consumer Shield."
    },
    {
      type: "Judgment",
      rule: "Conditional for Consumer Shield."
    }
  ],

  rejectedDebtTypes: [
    "Timeshare",
    "Mortgage",
    "Federal Student Loan",
    "IRS Tax Debt",
    "Cross Collateralized Account",
    "Furniture Store Financing",
    "Direct Furniture Store Loan",
    "Loan from Individual",
    "Installment Sales Contract",
    "Credit Union Loan",
    "Military Account",
    "AFES Account"
  ],

  creditorRules: [
    "Consumer Shield is more debt-type driven than creditor-name driven.",
    "Credit union loans are not accepted.",
    "Furniture store financing is not accepted.",
    "Military / AFES accounts are not accepted.",
    "Timeshares are not accepted.",
    "Mortgage debt is not accepted.",
    "Federal student loans are not accepted.",
    "IRS / tax debt is not accepted.",
    "Cross-collateralized accounts are not accepted.",
    "Loans from individuals are not accepted.",
    "Installment sales contracts are not accepted."
  ],

  positioning: {
    bestFor: [
      "Prospects with $4,000-$6,000 in enrolled debt",
      "Prospects who want debt validation instead of settlement",
      "Prospects who want a fixed monthly payment structure",
      "Prospects who want a simple tier-based program"
    ],
    notFor: [
      "Prospects in blackout states",
      "Prospects with excluded debt types",
      "Prospects specifically wanting debt settlement",
      "Prospects wanting attorney-led legal support as the primary value"
    ]
  },

  routingGuidance: {
    primaryRule:
      "Deals from $4,000 to $6,000 route to Consumer Shield when eligible.",
    secondaryRule:
      "For debt above $6,000, Consumer Shield can be used as a fallback when Legacy is unavailable in the state or when debt validation is preferred.",
    fallbackRule:
      "If Consumer Shield is not available due to state or debt type restrictions, another backend or no-option outcome must be used."
  },

  compliance: {
    requiredDisclosures: [
      "Consumer Shield is a debt validation program, not debt settlement.",
      "Results vary depending on the account and creditor response.",
      "Not all debts qualify.",
      "No specific outcome can be guaranteed."
    ],
    prohibitedClaims: [
      "Guaranteed removal",
      "Guaranteed results",
      "We will erase your debt",
      "This fixes your credit",
      "Instant deletion"
    ],
    approvedPhrases: [
      "Debt validation",
      "Fixed monthly payment",
      "Results vary",
      "Not all debts qualify",
      "Legal challenge process"
    ]
  },

  agentNotes: {
    quickPitch:
      "Consumer Shield is the best fit when the prospect wants debt validation with a fixed monthly payment and defined term.",
    salesAngle:
      "Position it as structured, predictable, and validation-focused rather than settlement-focused.",
    caution:
      "Do not present Consumer Shield as debt settlement or promise account removal."
  }
};
