export const creditorMatcher = {
  // -----------------------------
  // Helper normalization
  // -----------------------------
  normalize(value) {
    return String(value || "")
      .toUpperCase()
      .replace(/&/g, " AND ")
      .replace(/[^A-Z0-9 ]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  },

  // -----------------------------
  // Conditional creditors / account types
  // -----------------------------
  conditionalCreditors: [
    {
      key: "USAA",
      aliases: ["USAA"],
      rule: "USAA is conditional for Consumer Shield."
    },
    {
      key: "TRIBAL_LOAN",
      aliases: ["TRIBAL LOAN"],
      rule: "Tribal loans are conditional for Consumer Shield."
    },
    {
      key: "DEFICIENCY",
      aliases: ["DEFICIENCY", "REPOSSESSION DEFICIENCY", "AUTO REPO DEFICIENCY"],
      rule: "Deficiency balances are conditional for Consumer Shield."
    },
    {
      key: "JUDGMENT",
      aliases: ["JUDGMENT"],
      rule: "Judgments are conditional for Consumer Shield."
    },
    {
      key: "BUSINESS_DEBT",
      aliases: ["BUSINESS DEBT", "BUSINESS LOAN", "COMMERCIAL DEBT"],
      rule: "Business debt is conditional for Consumer Shield."
    }
  ],

  // -----------------------------
  // Unacceptable creditors / types
  // -----------------------------
  unacceptableCreditors: [
    {
      key: "CREDIT_UNION",
      aliases: [
        "CREDIT UNION",
        "FCU",
        "FEDERAL CREDIT UNION",
        "CU"
      ],
      rule: "Credit union loans are not accepted by Consumer Shield."
    },
    {
      key: "FURNITURE_FINANCING",
      aliases: [
        "FURNITURE STORE FINANCING",
        "DIRECT FURNITURE STORE LOAN",
        "FURNITURE LOAN"
      ],
      rule: "Furniture store financing is not accepted by Consumer Shield."
    },
    {
      key: "MILITARY_STAR",
      aliases: [
        "MILITARY STAR",
        "EXCHANGE CREDIT PROGRAM",
        "AFES",
        "AAFES"
      ],
      rule: "Military / AFES accounts are not accepted by Consumer Shield."
    },
    {
      key: "TIMESHARE",
      aliases: ["TIMESHARE", "TIMESHARE LOAN"],
      rule: "Timeshares are not accepted by Consumer Shield."
    },
    {
      key: "MORTGAGE",
      aliases: ["MORTGAGE", "HOME LOAN", "HELOC", "HOME EQUITY"],
      rule: "Mortgage debt is not accepted by Consumer Shield."
    },
    {
      key: "FEDERAL_STUDENT_LOAN",
      aliases: ["FEDERAL STUDENT LOAN", "FEDLOAN", "DEPT OF EDUCATION", "MOHELA FEDERAL"],
      rule: "Federal student loans are not accepted by Consumer Shield."
    },
    {
      key: "IRS_TAX_DEBT",
      aliases: ["IRS", "IRS TAX DEBT", "INTERNAL REVENUE SERVICE", "STATE TAX BOARD", "FTB"],
      rule: "IRS / tax debt is not accepted by Consumer Shield."
    },
    {
      key: "CROSS_COLLATERALIZED",
      aliases: ["CROSS COLLATERALIZED", "CROSS COLLATERALIZED ACCOUNT"],
      rule: "Cross-collateralized accounts are not accepted by Consumer Shield."
    },
    {
      key: "LOAN_FROM_INDIVIDUAL",
      aliases: ["LOAN FROM INDIVIDUAL", "PERSONAL LOAN FROM FAMILY", "LOAN FROM FRIEND"],
      rule: "Loans from individuals are not accepted by Consumer Shield."
    },
    {
      key: "INSTALLMENT_SALES_CONTRACT",
      aliases: ["INSTALLMENT SALES CONTRACT"],
      rule: "Installment sales contracts are not accepted by Consumer Shield."
    }
  ],

  // -----------------------------
  // Matching helpers
  // -----------------------------
  matchesAlias(input, alias) {
    const a = this.normalize(input);
    const b = this.normalize(alias);

    if (!a || !b) return false;
    if (a === b) return true;
    if (a.includes(b) || b.includes(a)) return true;

    const aTokens = a.split(" ");
    const bTokens = b.split(" ");
    const [shorter, longer] =
      aTokens.length <= bTokens.length ? [aTokens, bTokens] : [bTokens, aTokens];

    return (
      shorter.length >= 2 &&
      shorter.every((token) => token.length > 2 && longer.includes(token))
    );
  },

  findConditional(input) {
    if (!input) return null;

    for (const creditor of this.conditionalCreditors) {
      for (const alias of creditor.aliases) {
        if (this.matchesAlias(input, alias)) {
          return {
            matched: true,
            type: "conditional",
            key: creditor.key,
            input,
            matchedAlias: alias,
            rule: creditor.rule
          };
        }
      }
    }

    return null;
  },

  findUnacceptable(input) {
    if (!input) return null;

    for (const creditor of this.unacceptableCreditors) {
      for (const alias of creditor.aliases) {
        if (this.matchesAlias(input, alias)) {
          return {
            matched: true,
            type: "unacceptable",
            key: creditor.key,
            input,
            matchedAlias: alias,
            rule: creditor.rule
          };
        }
      }
    }

    return null;
  },

  // -----------------------------
  // Public matcher
  // -----------------------------
  findMatch(input, options = {}) {
    const debtType = this.normalize(options.debtType || "");
    const creditorName = this.normalize(input || "");

    // debt type driven checks first
    const debtTypeChecks = [
      {
        test: ["TIMESHARE"].includes(debtType),
        result: {
          matched: true,
          status: "unacceptable",
          type: "unacceptable",
          input,
          matchedAlias: debtType,
          rule: "Timeshares are not accepted by Consumer Shield."
        }
      },
      {
        test: ["MORTGAGE", "HOME LOAN", "HELOC", "HOME EQUITY"].includes(debtType),
        result: {
          matched: true,
          status: "unacceptable",
          type: "unacceptable",
          input,
          matchedAlias: debtType,
          rule: "Mortgage debt is not accepted by Consumer Shield."
        }
      },
      {
        test: ["FEDERAL STUDENT LOAN"].includes(debtType),
        result: {
          matched: true,
          status: "unacceptable",
          type: "unacceptable",
          input,
          matchedAlias: debtType,
          rule: "Federal student loans are not accepted by Consumer Shield."
        }
      },
      {
        test: ["IRS TAX DEBT"].includes(debtType),
        result: {
          matched: true,
          status: "unacceptable",
          type: "unacceptable",
          input,
          matchedAlias: debtType,
          rule: "IRS / tax debt is not accepted by Consumer Shield."
        }
      },
      {
        test: ["CROSS COLLATERALIZED ACCOUNT"].includes(debtType),
        result: {
          matched: true,
          status: "unacceptable",
          type: "unacceptable",
          input,
          matchedAlias: debtType,
          rule: "Cross-collateralized accounts are not accepted by Consumer Shield."
        }
      },
      {
        test: ["FURNITURE STORE FINANCING", "DIRECT FURNITURE STORE LOAN"].includes(debtType),
        result: {
          matched: true,
          status: "unacceptable",
          type: "unacceptable",
          input,
          matchedAlias: debtType,
          rule: "Furniture store financing is not accepted by Consumer Shield."
        }
      },
      {
        test: ["LOAN FROM INDIVIDUAL"].includes(debtType),
        result: {
          matched: true,
          status: "unacceptable",
          type: "unacceptable",
          input,
          matchedAlias: debtType,
          rule: "Loans from individuals are not accepted by Consumer Shield."
        }
      },
      {
        test: ["INSTALLMENT SALES CONTRACT"].includes(debtType),
        result: {
          matched: true,
          status: "unacceptable",
          type: "unacceptable",
          input,
          matchedAlias: debtType,
          rule: "Installment sales contracts are not accepted by Consumer Shield."
        }
      },
      {
        test: ["CREDIT UNION LOAN"].includes(debtType),
        result: {
          matched: true,
          status: "unacceptable",
          type: "unacceptable",
          input,
          matchedAlias: debtType,
          rule: "Credit union loans are not accepted by Consumer Shield."
        }
      },
      {
        test: ["MILITARY ACCOUNT", "AFES ACCOUNT"].includes(debtType),
        result: {
          matched: true,
          status: "unacceptable",
          type: "unacceptable",
          input,
          matchedAlias: debtType,
          rule: "Military / AFES accounts are not accepted by Consumer Shield."
        }
      },
      {
        test: ["USAA"].includes(debtType),
        result: {
          matched: true,
          status: "conditional",
          type: "conditional",
          input,
          matchedAlias: debtType,
          rule: "USAA is conditional for Consumer Shield."
        }
      },
      {
        test: ["DEFICIENCY", "REPOSSESSION DEFICIENCY", "AUTO REPO DEFICIENCY"].includes(debtType),
        result: {
          matched: true,
          status: "conditional",
          type: "conditional",
          input,
          matchedAlias: debtType,
          rule: "Deficiency balances are conditional for Consumer Shield."
        }
      },
      {
        test: ["TRIBAL LOAN"].includes(debtType),
        result: {
          matched: true,
          status: "conditional",
          type: "conditional",
          input,
          matchedAlias: debtType,
          rule: "Tribal loans are conditional for Consumer Shield."
        }
      },
      {
        test: ["JUDGMENT"].includes(debtType),
        result: {
          matched: true,
          status: "conditional",
          type: "conditional",
          input,
          matchedAlias: debtType,
          rule: "Judgments are conditional for Consumer Shield."
        }
      },
      {
        test: ["BUSINESS DEBT"].includes(debtType),
        result: {
          matched: true,
          status: "conditional",
          type: "conditional",
          input,
          matchedAlias: debtType,
          rule: "Business debt is conditional for Consumer Shield."
        }
      }
    ];

    const debtTypeHit = debtTypeChecks.find((x) => x.test);
    if (debtTypeHit) return debtTypeHit.result;

    // creditor name driven checks
    const conditional = this.findConditional(creditorName);
    if (conditional) {
      return {
        matched: true,
        status: "conditional",
        type: "conditional",
        input,
        matchedAlias: conditional.matchedAlias,
        rule: conditional.rule
      };
    }

    const unacceptable = this.findUnacceptable(creditorName);
    if (unacceptable) {
      return {
        matched: true,
        status: "unacceptable",
        type: "unacceptable",
        input,
        matchedAlias: unacceptable.matchedAlias,
        rule: unacceptable.rule
      };
    }

    return {
      matched: false,
      status: "unknown",
      type: "unknown",
      input,
      matchedAlias: null,
      rule: null
    };
  },

  isUnacceptable(input, options = {}) {
    const result = this.findMatch(input, options);
    return result.status === "unacceptable";
  },

  isConditional(input, options = {}) {
    const result = this.findMatch(input, options);
    return result.status === "conditional";
  },

  getRule(input, options = {}) {
    return this.findMatch(input, options).rule;
  }
};
