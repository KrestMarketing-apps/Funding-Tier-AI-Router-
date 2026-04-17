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
  // Conditional creditors
  // unsecured okay / secured not okay
  // -----------------------------
  conditionalCreditors: [
    {
      key: "LENDMARK",
      aliases: ["LENDMARK", "LENDMARK FINANCIAL"],
      rule: "No secured accounts. Unsecured is okay.",
      status: "conditional"
    },
    {
      key: "MARINER_FINANCE",
      aliases: ["MARINER", "MARINER FINANCE"],
      rule: "No secured accounts. Unsecured is okay.",
      status: "conditional"
    },
    {
      key: "ONEMAIN",
      aliases: ["ONEMAIN", "ONEMAIN FINANCIAL", "ONE MAIN", "ONE MAIN FINANCIAL"],
      rule: "No secured accounts. Unsecured is okay.",
      status: "conditional"
    },
    {
      key: "REGIONAL_FINANCE",
      aliases: ["REGIONAL FINANCE", "REGIONAL FINANCE CORP", "REGIONAL"],
      rule: "No secured accounts. Unsecured is okay.",
      status: "conditional"
    },
    {
      key: "REPUBLIC_FINANCE",
      aliases: ["REPUBLIC FINANCE", "REPUBLIC"],
      rule: "No secured accounts. Unsecured is okay.",
      status: "conditional"
    },
    {
      key: "GOLDMAN_SACHS",
      aliases: ["GOLDMAN SACHS", "GS", "GS BANK"],
      rule: "Goldman Sachs credit cards are not accepted, but Apple Cards and Goldman Sachs loans are accepted.",
      status: "conditional"
    }
  ],

  // -----------------------------
  // Unacceptable creditors
  // -----------------------------
  unacceptableCreditors: [
    {
      key: "ALLEVIATE_TAX",
      aliases: ["ALLEVIATE TAX LLC", "ALLEVIATE TAX"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "ACCEPTANCE_NOW",
      aliases: ["ACCEPTANCE NOW", "ACCEPTANCENOW"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "ACIMA",
      aliases: ["ACIMA", "ACIMA CREDIT"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "ADVANCE_FINANCIAL",
      aliases: ["ADVANCE FINANCIAL", "AF247"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "AGCO_FINANCE",
      aliases: ["AGCO FINANCE", "AGCO FINANCIAL"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "STATE_EMPLOYEE_CU",
      aliases: [
        "STATE EMPLOYEE CREDIT UNION",
        "STATE EMPLOYEES CREDIT UNION",
        "STATE EMPLOYEES C U",
        "STATE EMPLOYEES CU",
        "STATEEMP",
        "SECU",
        "STATE EMPLOYEE CU"
      ],
      rule: "All State Employee Credit Union variants are not accepted."
    },
    {
      key: "AQUA_FINANCE",
      aliases: ["AQUA FINANCE"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "BELL_FINANCE",
      aliases: ["BELL FINANCE", "BELL FINANCIAL"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "BHG",
      aliases: [
        "BHG",
        "BHG FINANCIAL",
        "BHG MONEY",
        "BANKERS HEALTHCARE GROUP"
      ],
      rule: "All BHG entities are not accepted."
    },
    {
      key: "BOBS_DISCOUNT_FURNITURE",
      aliases: [
        "BOBS DISCOUNT FURNITURE",
        "BOBS FURNITURE",
        "BOBS FINANCE",
        "BOB S DISCOUNT FURNITURE",
        "BOB S FURNITURE",
        "BOB S FINANCE"
      ],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "CONCORD_SERVICING",
      aliases: ["CONCORD SERVICING"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "CORNERSTONE_FINANCIAL",
      aliases: ["CORNERSTONE FINANCIAL", "CORNERSTONE FINANCE"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "CREDITCENTRAL",
      aliases: ["CREDITCENTRAL", "CREDIT CENTRAL"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "CREDOLOGI",
      aliases: ["CREDOLOGI LLC", "CREDOLOGI"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "DR_BANK",
      aliases: ["DR BANK"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "EMPOWER_FCU",
      aliases: ["EMPOWER FCU", "EMPOWER FEDERAL CREDIT UNION"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "ENERBANK",
      aliases: ["ENERBANK", "ENERBANK USA"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "ESL_CREDIT_UNION",
      aliases: ["ESL CREDIT UNION", "ESL FCU"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "FARMERS_FURNITURE",
      aliases: ["FARMERS FURNITURE", "FRMRS FURN"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "FCRP_CAPITAL",
      aliases: ["FCRP CAPITAL LLC", "FCRP CAPITAL"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "FORT_WORTH_CU",
      aliases: ["FORT WORTH CREDIT UNION", "FORTH WORTH CU", "FORT WORTH CU"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "FORTERA_CU",
      aliases: ["FORTERA CREDIT UNION", "FORTERA CU"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "GARDEN_FEDERAL_CU",
      aliases: ["GARDEN FEDERAL CREDIT UNION", "GARDEN FCU"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "GOLDEN_ONE_CU",
      aliases: ["GOLDEN ONE CREDIT UNION", "GOLDEN 1 CREDIT UNION", "GOLDEN1"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "GOODLEAP",
      aliases: ["GOODLEAP", "GOOD LEAP", "LOAN PAL", "LOANPAL"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "HAWAII_CU",
      aliases: ["HAWAII CU", "HAWAII CREDIT UNION", "HAWAII USA FEDERAL CREDIT UNION"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "HC_ROYA_HYCITE_ROYAL_PRESTIGE",
      aliases: ["HC ROYA", "HYCITE", "ROYAL PRESTIGE"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "HEIGHTS_FINANCIAL",
      aliases: ["HEIGHTS FINANCIAL", "HEIGHTS FINANCE"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "ISLAND_FINANCE",
      aliases: ["ISLAND FINANCE", "ISLAND FINANCE PR"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "ISPC",
      aliases: ["ISPC"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "KABBAGE",
      aliases: ["KABBAGE", "KABBAGE LOANS"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "KIKOFF",
      aliases: ["KIKOFF"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "KOALAFI",
      aliases: ["KOALAFI"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "LHPCC_TRUST",
      aliases: ["LHPCC TRUST I", "LHPCC"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "LOCAL_GOV_FCU",
      aliases: ["LOCAL GOVERNMENT FEDERAL CREDIT UNION", "LGFCU"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "MATCO",
      aliases: ["MATCO TOOLS FINANCING", "MATCO FIN", "MATCO TOOLS"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "MILITARY_STAR",
      aliases: ["MILITARY STAR", "EXCHANGE CREDIT PROGRAM"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "NEBRASKA_FURNITURE",
      aliases: ["NEBRASKA FURNITURE", "NEBRASKA FURNITURE MART"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "OMNI_LOANS",
      aliases: ["OMNI LOANS", "OMNI FINANCIAL", "OMNI"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "OPENSKY",
      aliases: ["OPENSKY", "OPENSKY CARD"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "PINNACLE_FINANCIAL",
      aliases: ["PINNACLE FINANCIAL GROUP", "PINNACLE FINANCIAL"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "PIONEER_LOANS",
      aliases: ["PIONEER LOANS", "PIONEER"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "POPULAR_BANK",
      aliases: ["POPULAR BANK", "BANCO POPULAR"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "POWERPAY",
      aliases: ["POWERPAY", "POWER PAY"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "PREFERRED_LOANS",
      aliases: ["PREFERRED LOANS", "PREFERRED"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "QUICK_HELP_LOANS",
      aliases: ["QUICK HELP LOANS", "QUICK HELP"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "RED_RIVER_CREDIT",
      aliases: ["RED RIVER CREDIT", "REDRIVERCR"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "REDSTONE_CU",
      aliases: ["REDSTONE CREDIT UNION", "REDSTONE FCU"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "RENT_A_CENTER",
      aliases: ["RENT A CENTER", "RENT-A-CENTER", "RAC"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "RFFC_FINANCIAL",
      aliases: ["RFFC FINANCIAL", "RFFC"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "ROBINHOOD",
      aliases: ["ROBINHOOD", "ROBINHOOD FINANCIAL"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "SECURITY_FINANCE",
      aliases: ["SECURITY FINANCE", "SECURITY FINANCE CORP"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "SERVICE_FINANCE",
      aliases: ["SERVICE FINANCE COMPANY", "SVCFIN", "SRVFINCO"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "SNAP_ON_CREDIT",
      aliases: ["SNAP ON CREDIT", "SNAP-ON CREDIT", "SNAPON CREDIT"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "SOLAR_MOSAIC",
      aliases: ["SOLAR MOSAIC", "MOSAIC SOLAR"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "SOUTHERN_FINANCE",
      aliases: ["SOUTHERN FINANCE"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "SUNSET_FINANCIAL",
      aliases: ["SUNSET FINANCIAL", "SUNSET FINANCE"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "TOLEDO_FINANCE",
      aliases: ["TOLEDO FINANCE"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "TOWER_LOANS",
      aliases: ["TOWER LOANS", "TOWER LOAN", "TOWER FINANCE"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "WEST_CREEK",
      aliases: ["WEST CREEK FINANCIAL", "WEST CREEK"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "WSECU",
      aliases: ["WSECU", "WASHINGTON STATE EMPLOYEES CREDIT UNION"],
      rule: "Not accepted by Level Debt."
    },
    {
      key: "YENDO",
      aliases: ["YENDO"],
      rule: "Not accepted by Level Debt."
    }
  ],

  // -----------------------------
  // Internal matching helpers
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
    const isSecured = options.isSecured === true;
    const accountType = this.normalize(options.accountType || "");

    // Conditional first so secured-vs-unsecured logic can be applied
    const conditional = this.findConditional(input);
    if (conditional) {
      if (conditional.key === "GOLDMAN_SACHS") {
        if (accountType.includes("APPLE CARD") || accountType.includes("GS LOAN") || accountType.includes("GOLDMAN SACHS LOAN")) {
          return {
            matched: true,
            status: "accepted",
            type: "special_allowed",
            input,
            matchedAlias: conditional.matchedAlias,
            rule: "Apple Cards and Goldman Sachs loans are accepted."
          };
        }

        return {
          matched: true,
          status: "unacceptable",
          type: "unacceptable",
          input,
          matchedAlias: conditional.matchedAlias,
          rule: "Goldman Sachs credit cards are not accepted, but Apple Cards and GS loans are accepted."
        };
      }

      if (isSecured) {
        return {
          matched: true,
          status: "unacceptable",
          type: "conditional_secured_block",
          input,
          matchedAlias: conditional.matchedAlias,
          rule: conditional.rule
        };
      }

      return {
        matched: true,
        status: "conditional",
        type: "conditional",
        input,
        matchedAlias: conditional.matchedAlias,
        rule: conditional.rule
      };
    }

    const unacceptable = this.findUnacceptable(input);
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

  // -----------------------------
  // Convenience helpers
  // -----------------------------
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
