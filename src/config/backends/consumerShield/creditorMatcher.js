/**
 * ============================================================
 *  CONSUMER SHIELD — Creditor Matcher
 *  creditorMatcher.js
 * ============================================================
 *  Determines whether a creditor name or debt type is:
 *    - accepted          → proceed with enrollment
 *    - conditional       → requires additional review / docs
 *    - unacceptable      → cannot be enrolled
 *
 *  Usage:
 *    import { creditorMatcher } from "./creditorMatcher.js";
 *    const result = creditorMatcher.findMatch("USAA", { debtType: "Unsecured" });
 *    // → { matched: true, status: "conditional", rule: "USAA is conditional..." }
 * ============================================================
 */

export const creditorMatcher = {

  // ─────────────────────────────────────────────────────────
  //  NORMALIZATION
  // ─────────────────────────────────────────────────────────

  normalize(value) {
    return String(value || "")
      .toUpperCase()
      .replace(/&/g, " AND ")
      .replace(/[^A-Z0-9 ]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  },

  // ─────────────────────────────────────────────────────────
  //  CONDITIONAL DEBT TYPES
  //  These are accepted by Consumer Shield with caveats.
  // ─────────────────────────────────────────────────────────

  conditionalDebtTypes: [
    {
      key: "USAA",
      aliases: ["USAA", "USAA FEDERAL SAVINGS BANK", "USAA CREDIT CARD"],
      rule: "USAA is conditional for Consumer Shield — documentation required."
    },
    {
      key: "TRIBAL_LOAN",
      aliases: ["TRIBAL LOAN", "TRIBAL LENDING"],
      rule: "Tribal loans are conditional for Consumer Shield — must verify it is not a wage-assignment loan."
    },
    {
      key: "DEFICIENCY",
      aliases: [
        "DEFICIENCY",
        "REPOSSESSION DEFICIENCY",
        "AUTO REPO DEFICIENCY",
        "REPO DEFICIENCY",
        "DEFICIENCY BALANCE"
      ],
      rule: "Deficiency balances are conditional for Consumer Shield — must be in 3rd party collections."
    },
    {
      key: "JUDGMENT",
      aliases: ["JUDGMENT", "JUDGEMENT"],
      rule: "Judgments are conditional for Consumer Shield — must already be enrolled prior to judgment."
    },
    {
      key: "BUSINESS_DEBT",
      aliases: ["BUSINESS DEBT", "BUSINESS LOAN", "COMMERCIAL DEBT"],
      rule: "Business debt is conditional for Consumer Shield — must be in 3rd party collections."
    },
    {
      key: "APARTMENT_BACK_RENT",
      aliases: [
        "APARTMENT BACK RENT",
        "BACK RENT",
        "BACK RENT COLLECTIONS",
        "APARTMENT BACK RENT COLLECTIONS"
      ],
      rule: "Apartment back rent is conditional — must be in collections and client must no longer be living in the unit."
    }
  ],

  // ─────────────────────────────────────────────────────────
  //  UNACCEPTABLE DEBT TYPES
  //  These debt types are never accepted by Consumer Shield.
  // ─────────────────────────────────────────────────────────

  unacceptableDebtTypes: [
    {
      key: "TIMESHARE",
      aliases: ["TIMESHARE", "TIMESHARE LOAN"],
      rule: "Timeshares are not accepted by Consumer Shield."
    },
    {
      key: "MORTGAGE",
      aliases: [
        "MORTGAGE",
        "HOME LOAN",
        "HELOC",
        "HOME EQUITY",
        "HOME EQUITY LINE OF CREDIT",
        "HOME EQUITY LOAN"
      ],
      rule: "Mortgage / home equity debt is not accepted by Consumer Shield."
    },
    {
      key: "FEDERAL_STUDENT_LOAN",
      aliases: [
        "FEDERAL STUDENT LOAN",
        "FEDLOAN",
        "DEPT OF EDUCATION",
        "DEPARTMENT OF EDUCATION",
        "MOHELA FEDERAL",
        "NELNET FEDERAL",
        "GREAT LAKES FEDERAL"
      ],
      rule: "Federal student loans are not accepted by Consumer Shield."
    },
    {
      key: "IRS_TAX_DEBT",
      aliases: [
        "IRS",
        "IRS TAX DEBT",
        "INTERNAL REVENUE SERVICE",
        "STATE TAX BOARD",
        "FTB",
        "TAX DEBT",
        "TAX LIEN"
      ],
      rule: "IRS / tax debt is not accepted by Consumer Shield."
    },
    {
      key: "CROSS_COLLATERALIZED",
      aliases: [
        "CROSS COLLATERALIZED",
        "CROSS COLLATERALIZED ACCOUNT",
        "CROSS COLLATERAL"
      ],
      rule: "Cross-collateralized accounts are not accepted by Consumer Shield."
    },
    {
      key: "FURNITURE_FINANCING",
      aliases: [
        "FURNITURE STORE FINANCING",
        "DIRECT FURNITURE STORE LOAN",
        "FURNITURE LOAN",
        "FURNITURE FINANCING"
      ],
      rule: "Furniture store financing is not accepted by Consumer Shield."
    },
    {
      key: "LOAN_FROM_INDIVIDUAL",
      aliases: [
        "LOAN FROM INDIVIDUAL",
        "PERSONAL LOAN FROM FAMILY",
        "LOAN FROM FRIEND",
        "PRIVATE LOAN"
      ],
      rule: "Loans from individuals are not accepted by Consumer Shield."
    },
    {
      key: "INSTALLMENT_SALES_CONTRACT",
      aliases: [
        "INSTALLMENT SALES CONTRACT",
        "RETAIL INSTALLMENT CONTRACT",
        "RETAIL INSTALLMENT AGREEMENT"
      ],
      rule: "Installment sales contracts are not accepted by Consumer Shield."
    },
    {
      key: "CREDIT_UNION_LOAN",
      aliases: [
        "CREDIT UNION LOAN",
        "CREDIT UNION DEBT",
        "CREDIT UNION ACCOUNT"
      ],
      rule: "Credit union loans are not accepted by Consumer Shield."
    },
    {
      key: "MILITARY_ACCOUNT",
      aliases: [
        "MILITARY ACCOUNT",
        "AFES ACCOUNT",
        "MILITARY STAR CARD",
        "EXCHANGE CREDIT"
      ],
      rule: "Military / AFES accounts are not accepted by Consumer Shield."
    },
    {
      key: "SECURED_LOAN",
      aliases: [
        "SECURED LOAN",
        "AUTO LOAN SECURED",
        "COLLATERALIZED LOAN",
        "SECURED DEBT"
      ],
      rule: "Secured loans / collateralized debt is not accepted by Consumer Shield."
    },
    {
      key: "ALIMONY_CHILD_SUPPORT",
      aliases: [
        "ALIMONY",
        "CHILD SUPPORT",
        "SPOUSAL SUPPORT",
        "DOMESTIC SUPPORT"
      ],
      rule: "Alimony / child support obligations are not accepted by Consumer Shield."
    },
    {
      key: "WAGE_GARNISHMENT",
      aliases: [
        "WAGE GARNISHMENT",
        "COURT ORDERED GARNISHMENT",
        "WAGE ASSIGNMENT"
      ],
      rule: "Wage garnishments are not accepted by Consumer Shield."
    },
    {
      key: "CASINO_GAMBLING",
      aliases: [
        "CASINO DEBT",
        "GAMBLING DEBT",
        "CASINO MARKER"
      ],
      rule: "Casino / gambling debts are not accepted by Consumer Shield."
    },
    {
      key: "GOVERNMENT_FINES",
      aliases: [
        "CITY DEBT",
        "COUNTY DEBT",
        "STATE DEBT",
        "FEDERAL DEBT",
        "CITATION",
        "TICKET",
        "PARKING TICKET",
        "GOVERNMENT FINE"
      ],
      rule: "Government citations, fines, and tickets are not accepted by Consumer Shield."
    }
  ],

  // ─────────────────────────────────────────────────────────
  //  UNACCEPTABLE NAMED CREDITORS
  //  Specific company names rejected by Consumer Shield.
  // ─────────────────────────────────────────────────────────

  unacceptableNamedCreditors: [

    // ── Military / Government-backed ──────────────────────
    {
      key: "MILITARY_STAR",
      aliases: [
        "MILITARY STAR",
        "MILITARY STAR CARD",
        "EXCHANGE CREDIT PROGRAM",
        "AFES",
        "AAFES",
        "ARMY AIR FORCE EXCHANGE"
      ],
      rule: "Military Star / AFES accounts are not accepted by Consumer Shield."
    },
    {
      key: "VA_LOAN",
      aliases: [
        "VA LOAN",
        "VETERANS AFFAIRS LOAN",
        "VETERANS ADMINISTRATION",
        "VA HOME LOAN"
      ],
      rule: "VA loans are not accepted by Consumer Shield — government-backed secured debt."
    },
    {
      key: "SBA_LOAN",
      aliases: [
        "SBA LOAN",
        "SBA LOANS",
        "SMALL BUSINESS ADMINISTRATION",
        "SBA"
      ],
      rule: "SBA loans are not accepted by Consumer Shield — government-backed business debt."
    },

    // ── Solar / Home Improvement Financing ───────────────
    {
      key: "GOODLEAP",
      aliases: [
        "GOODLEAP",
        "GOOD LEAP",
        "GOODLEAP LLC",
        "GOODLEAP SOLAR",
        "LOANPAL",
        "LOAN PAL"
      ],
      rule: "GoodLeap / LoanPal (solar / home improvement financing) is not accepted by Consumer Shield — secured to property."
    },
    {
      key: "SOLAR_MOSAIC",
      aliases: [
        "SOLAR MOSAIC",
        "MOSAIC SOLAR",
        "MOSAIC",
        "SOLARMOSAIC"
      ],
      rule: "Solar Mosaic is not accepted by Consumer Shield — solar energy financing secured to property."
    },
    {
      key: "AQUA_FINANCE",
      aliases: [
        "AQUA FINANCE",
        "AQUAFINANCE",
        "AQUA FIN"
      ],
      rule: "Aqua Finance (HVAC / home improvement) is not accepted by Consumer Shield."
    },
    {
      key: "ENERBANK",
      aliases: [
        "ENERBANK",
        "ENERBANK USA",
        "REGIONS HOME IMPROVEMENT"
      ],
      rule: "EnerBank (home improvement financing) is not accepted by Consumer Shield."
    },
    {
      key: "SERVICE_FINANCE",
      aliases: [
        "SERVICE FINANCE COMPANY",
        "SERVICE FINANCE",
        "SVCFIN",
        "SRVFINCO"
      ],
      rule: "Service Finance Company (HVAC / home improvement) is not accepted by Consumer Shield."
    },
    {
      key: "POWERPAY",
      aliases: [
        "POWERPAY",
        "POWER PAY"
      ],
      rule: "PowerPay (home improvement financing) is not accepted by Consumer Shield."
    },
    {
      key: "GREENSKY",
      aliases: [
        "GREENSKY",
        "GREEN SKY",
        "GREENSKY LLC"
      ],
      rule: "GreenSky (home improvement financing) is not accepted by Consumer Shield."
    },
    {
      key: "LIGHTSTREAM_HOME",
      aliases: [
        "LIGHTSTREAM HOME IMPROVEMENT",
        "TRUIST LIGHTSTREAM HOME"
      ],
      rule: "LightStream home improvement loans are not accepted by Consumer Shield — secured / home improvement."
    },

    // ── Vehicle / Auto-secured ────────────────────────────
    {
      key: "YENDO",
      aliases: [
        "YENDO"
      ],
      rule: "Yendo (vehicle-equity credit card) is not accepted by Consumer Shield — secured to vehicle title."
    },
    {
      key: "TOLEDO_FINANCE",
      aliases: [
        "TOLEDO FINANCE",
        "TOLEDO FINANCIAL"
      ],
      rule: "Toledo Finance (auto / subprime) is not accepted by Consumer Shield."
    },

    // ── Rent-to-Own / POS Lease ───────────────────────────
    {
      key: "RENT_A_CENTER",
      aliases: [
        "RENT A CENTER",
        "RENT-A-CENTER",
        "RENTACENTER",
        "RAC"
      ],
      rule: "Rent-A-Center (rent-to-own) is not accepted by Consumer Shield — not traditional unsecured debt."
    },
    {
      key: "ACCEPTANCE_NOW",
      aliases: [
        "ACCEPTANCE NOW",
        "ACCEPTANCENOW",
        "ACCEPTANCE NOW LEASING"
      ],
      rule: "Acceptance Now (rent-to-own) is not accepted by Consumer Shield."
    },
    {
      key: "ACIMA",
      aliases: [
        "ACIMA",
        "ACIMA CREDIT",
        "ACIMA DIGITAL",
        "ACIMA LEASING"
      ],
      rule: "Acima (lease-to-own / POS financing) is not accepted by Consumer Shield."
    },
    {
      key: "KOALAFI",
      aliases: [
        "KOALAFI",
        "WEST CREEK FINANCIAL KOALAFI"
      ],
      rule: "Koalafi (lease-to-own / POS financing) is not accepted by Consumer Shield."
    },
    {
      key: "FARMERS_FURNITURE",
      aliases: [
        "FARMERS FURNITURE",
        "FRMRS FURN",
        "FARMERS HOME FURNITURE"
      ],
      rule: "Farmers Furniture (rent-to-own) is not accepted by Consumer Shield."
    },

    // ── Retail Furniture / Installment ────────────────────
    {
      key: "BOBS_DISCOUNT",
      aliases: [
        "BOBS DISCOUNT FURNITURE",
        "BOB DISCOUNT FURNITURE",
        "BOBS FURNITURE",
        "BOBS FINANCE",
        "BOB FINANCE",
        "BOB S DISCOUNT"
      ],
      rule: "Bob's Discount Furniture (retail installment) is not accepted by Consumer Shield."
    },
    {
      key: "NEBRASKA_FURNITURE",
      aliases: [
        "NEBRASKA FURNITURE",
        "NEBRASKA FURNITURE MART",
        "NFM"
      ],
      rule: "Nebraska Furniture Mart (retail installment) is not accepted by Consumer Shield."
    },

    // ── Tool / Equipment Financing (Secured) ─────────────
    {
      key: "SNAP_ON_CREDIT",
      aliases: [
        "SNAP ON CREDIT",
        "SNAP-ON CREDIT",
        "SNAPON CREDIT",
        "SNAP ON FINANCIAL",
        "SNAP ON TOOLS CREDIT"
      ],
      rule: "Snap-On Credit (tool dealer / secured financing) is not accepted by Consumer Shield."
    },
    {
      key: "WEST_CREEK_FINANCIAL",
      aliases: [
        "WEST CREEK FINANCIAL",
        "WEST CREEK FINANCE",
        "WESTCREEK FINANCIAL"
      ],
      rule: "West Creek Financial (subprime secured consumer financing) is not accepted by Consumer Shield."
    },

    // ── Named Credit Unions ───────────────────────────────
    {
      key: "STATE_EMPLOYEES_CU",
      aliases: [
        "STATE EMPLOYEES CREDIT UNION",
        "STATE EMPLOYEES C U",
        "STATEEMP",
        "SECU",
        "NC STATE EMPLOYEES CREDIT UNION"
      ],
      rule: "State Employees Credit Union — all state variants are not accepted by Consumer Shield."
    },
    {
      key: "EMPOWER_FCU",
      aliases: [
        "EMPOWER FCU",
        "EMPOWER FEDERAL CREDIT UNION"
      ],
      rule: "Empower FCU is not accepted by Consumer Shield."
    },
    {
      key: "ESL_CREDIT_UNION",
      aliases: [
        "ESL CREDIT UNION",
        "ESL FCU",
        "ESL FEDERAL CREDIT UNION"
      ],
      rule: "ESL Credit Union is not accepted by Consumer Shield."
    },
    {
      key: "REDSTONE_CU",
      aliases: [
        "REDSTONE CREDIT UNION",
        "REDSTONE FEDERAL CREDIT UNION"
      ],
      rule: "Redstone Credit Union is not accepted by Consumer Shield."
    },
    {
      key: "FORTERA_CU",
      aliases: [
        "FORTERA CREDIT UNION",
        "FORTERA FCU"
      ],
      rule: "Fortera Credit Union is not accepted by Consumer Shield."
    },
    {
      key: "LOCAL_GOVT_FCU",
      aliases: [
        "LOCAL GOVERNMENT FEDERAL CREDIT UNION",
        "LOCAL GOVERNMENT FCU",
        "LGFCU"
      ],
      rule: "Local Government Federal Credit Union is not accepted by Consumer Shield."
    },
    {
      key: "GARDEN_FCU",
      aliases: [
        "GARDEN FEDERAL CREDIT UNION",
        "GARDEN FCU"
      ],
      rule: "Garden Federal Credit Union is not accepted by Consumer Shield."
    },
    {
      key: "GOLDEN_ONE_CU",
      aliases: [
        "GOLDEN ONE CREDIT UNION",
        "GOLDEN 1 CREDIT UNION",
        "GOLDEN1"
      ],
      rule: "Golden One Credit Union is not accepted by Consumer Shield."
    },
    {
      key: "HAWAII_CU",
      aliases: [
        "HAWAII CREDIT UNION",
        "HAWAII CU",
        "HCU"
      ],
      rule: "Hawaii Credit Union is not accepted by Consumer Shield."
    },
    {
      key: "WSECU",
      aliases: [
        "WSECU",
        "WASHINGTON STATE EMPLOYEES CREDIT UNION"
      ],
      rule: "WSECU (Washington State Employees CU) is not accepted by Consumer Shield."
    },

    // ── Credit Builder (not enrollable debt) ─────────────
    {
      key: "KIKOFF",
      aliases: [
        "KIKOFF",
        "KIKOFF INC"
      ],
      rule: "KIKOFF (credit builder) is not accepted by Consumer Shield — not traditional debt."
    },
    {
      key: "OPENSKY",
      aliases: [
        "OPENSKY",
        "OPEN SKY",
        "OPENSKY SECURED VISA"
      ],
      rule: "OpenSky (secured credit card) is not accepted by Consumer Shield."
    },

    // ── MLM / Direct Sales ────────────────────────────────
    {
      key: "HC_ROYA",
      aliases: [
        "HC ROYA",
        "HYCITE",
        "HC ROYAL",
        "ROYAL PRESTIGE",
        "REGAL WARE"
      ],
      rule: "HC Roya / HyCite / Royal Prestige (MLM cookware direct sales) is not accepted by Consumer Shield."
    },

    // ── Regional / PR Specific ────────────────────────────
    {
      key: "ISLAND_FINANCE",
      aliases: [
        "ISLAND FINANCE",
        "ISLAND FINANCE PR",
        "RELIABLE FINANCIAL SERVICES PR"
      ],
      rule: "Island Finance (Puerto Rico) is not accepted by Consumer Shield."
    },
    {
      key: "POPULAR_BANK",
      aliases: [
        "POPULAR BANK",
        "BANCO POPULAR",
        "POPULAR INC"
      ],
      rule: "Popular Bank / Banco Popular (Puerto Rico commercial bank) is not accepted by Consumer Shield."
    },

    // ── Goldman Sachs Credit Card ─────────────────────────
    {
      key: "GOLDMAN_SACHS_CC",
      aliases: [
        "GOLDMAN SACHS CREDIT CARD",
        "MARCUS CREDIT CARD",
        "MARCUS BY GOLDMAN SACHS CREDIT CARD",
        "GS CREDIT CARD"
      ],
      rule: "Goldman Sachs credit cards (Marcus Card) are not accepted by Consumer Shield. Apple Card and GS personal loans ARE accepted."
    },

    // ── Tax Relief Firms (not creditors) ─────────────────
    {
      key: "ALLEVIATE_TAX",
      aliases: [
        "ALLEVIATE TAX",
        "ALLEVIATE TAX LLC",
        "ALLEVIATE FINANCIAL"
      ],
      rule: "Alleviate Tax is a tax relief firm — not an enrollable creditor."
    },

    // ── BHG / Bankers Healthcare Group ───────────────────
    {
      key: "BHG_FINANCIAL",
      aliases: [
        "BHG FINANCIAL",
        "BHG MONEY",
        "BHG",
        "BANKERS HEALTHCARE GROUP",
        "BHG LOAN"
      ],
      rule: "All BHG / Bankers Healthcare Group entities are not accepted by Consumer Shield."
    },

    // ── Specific Consumer Installment Lenders ─────────────
    {
      key: "PINNACLE_FINANCIAL",
      aliases: [
        "PINNACLE FINANCIAL GROUP",
        "PINNACLE FINANCIAL",
        "PINNACLE GROUP"
      ],
      rule: "Pinnacle Financial Group is not accepted by Consumer Shield."
    },
    {
      key: "CONCORD_SERVICING",
      aliases: [
        "CONCORD SERVICING",
        "CONCORD SERVICING CORP"
      ],
      rule: "Concord Servicing is not accepted by Consumer Shield."
    },
    {
      key: "CREDOLOGI",
      aliases: [
        "CREDOLOGI",
        "CREDOLOGI LLC"
      ],
      rule: "Credologi (debt relief / personal lender) is not accepted by Consumer Shield."
    },
    {
      key: "KABBAGE",
      aliases: [
        "KABBAGE",
        "KABBAGE LOANS",
        "KABBAGE INC",
        "AMERICAN EXPRESS BUSINESS BLUEPRINT"
      ],
      rule: "Kabbage (small business lending) is not accepted by Consumer Shield."
    },
    {
      key: "ROBINHOOD",
      aliases: [
        "ROBINHOOD",
        "ROBINHOOD FINANCIAL",
        "ROBINHOOD MARKETS"
      ],
      rule: "Robinhood (investment / brokerage) is not accepted by Consumer Shield."
    }
  ],

  // ─────────────────────────────────────────────────────────
  //  CONDITIONAL NAMED CREDITORS
  //  These companies are accepted with stipulations.
  // ─────────────────────────────────────────────────────────

  conditionalNamedCreditors: [
    {
      key: "USAA",
      aliases: [
        "USAA",
        "USAA FEDERAL SAVINGS BANK",
        "USAA CREDIT CARD",
        "USAA BANK"
      ],
      rule: "USAA is conditional for Consumer Shield — documentation required."
    },
    {
      key: "LENDMARK",
      aliases: [
        "LENDMARK",
        "LENDMARK FINANCIAL",
        "LENDMARK FINANCIAL SERVICES"
      ],
      rule: "Lendmark — unsecured accounts only. Secured accounts are NOT accepted. Verify before enrolling."
    },
    {
      key: "MARINER_FINANCE",
      aliases: [
        "MARINER FINANCE",
        "MARINER",
        "MARINER FINANCIAL"
      ],
      rule: "Mariner Finance — unsecured accounts only. Secured accounts are NOT accepted. Verify before enrolling."
    },
    {
      key: "ONEMAIN_FINANCIAL",
      aliases: [
        "ONEMAIN",
        "ONEMAIN FINANCIAL",
        "ONE MAIN FINANCIAL",
        "ONE MAIN"
      ],
      rule: "OneMain Financial — unsecured accounts only. Secured accounts are NOT accepted. Verify before enrolling."
    },
    {
      key: "REGIONAL_FINANCE",
      aliases: [
        "REGIONAL FINANCE",
        "REGIONAL FINANCE CORP",
        "REGIONAL MANAGEMENT"
      ],
      rule: "Regional Finance — unsecured accounts only. Secured accounts are NOT accepted. Verify before enrolling."
    },
    {
      key: "REPUBLIC_FINANCE",
      aliases: [
        "REPUBLIC FINANCE",
        "REPUBLIC FINANCE LLC"
      ],
      rule: "Republic Finance — unsecured accounts only. Secured accounts are NOT accepted. Verify before enrolling."
    }
  ],

  // ─────────────────────────────────────────────────────────
  //  MATCHING HELPERS
  // ─────────────────────────────────────────────────────────

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

  searchList(input, list) {
    if (!input) return null;
    for (const entry of list) {
      for (const alias of entry.aliases) {
        if (this.matchesAlias(input, alias)) {
          return {
            matched: true,
            key: entry.key,
            input,
            matchedAlias: alias,
            rule: entry.rule
          };
        }
      }
    }
    return null;
  },

  // ─────────────────────────────────────────────────────────
  //  PUBLIC MATCHERS
  // ─────────────────────────────────────────────────────────

  findConditional(input) {
    const byDebtType = this.searchList(input, this.conditionalDebtTypes);
    if (byDebtType) return { ...byDebtType, type: "conditional", status: "conditional" };
    const byName = this.searchList(input, this.conditionalNamedCreditors);
    if (byName) return { ...byName, type: "conditional", status: "conditional" };
    return null;
  },

  findUnacceptable(input) {
    const byDebtType = this.searchList(input, this.unacceptableDebtTypes);
    if (byDebtType) return { ...byDebtType, type: "unacceptable", status: "unacceptable" };
    const byName = this.searchList(input, this.unacceptableNamedCreditors);
    if (byName) return { ...byName, type: "unacceptable", status: "unacceptable" };
    return null;
  },

  /**
   * Primary entry point.
   * @param {string} input          - Creditor name typed by the agent
   * @param {object} [options]
   * @param {string} [options.debtType] - Debt type selected for this row
   * @returns {{ matched, status, type, input, matchedAlias, rule }}
   */
  findMatch(input, options = {}) {
    const debtType = this.normalize(options.debtType || "");
    const creditorName = this.normalize(input || "");

    // 1. Check debt type first
    if (debtType) {
      const dtUnacceptable = this.searchList(debtType, this.unacceptableDebtTypes);
      if (dtUnacceptable) {
        return { matched: true, status: "unacceptable", type: "unacceptable",
          input, matchedAlias: debtType, rule: dtUnacceptable.rule };
      }
      const dtConditional = this.searchList(debtType, this.conditionalDebtTypes);
      if (dtConditional) {
        return { matched: true, status: "conditional", type: "conditional",
          input, matchedAlias: debtType, rule: dtConditional.rule };
      }
    }

    // 2. Check creditor name
    if (creditorName) {
      const unacceptable = this.findUnacceptable(creditorName);
      if (unacceptable) return unacceptable;
      const conditional = this.findConditional(creditorName);
      if (conditional) return conditional;
    }

    return {
      matched: false,
      status: "accepted",
      type: "accepted",
      input,
      matchedAlias: null,
      rule: null
    };
  },

  // Convenience wrappers
  isUnacceptable(input, options = {}) {
    return this.findMatch(input, options).status === "unacceptable";
  },
  isConditional(input, options = {}) {
    return this.findMatch(input, options).status === "conditional";
  },
  isAccepted(input, options = {}) {
    return this.findMatch(input, options).status === "accepted";
  },
  getRule(input, options = {}) {
    return this.findMatch(input, options).rule;
  }
};
