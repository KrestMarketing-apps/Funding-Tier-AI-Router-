/**
 * ============================================================
 *  CONSUMER SHIELD — Knowledgebase
 *  knowledgebase.js
 * ============================================================
 *  Single source of truth for Consumer Shield program rules,
 *  debt eligibility, state availability, compliance language,
 *  and agent positioning guidance.
 *
 *  Import:
 *    import { knowledgebase } from "./knowledgebase.js";
 * ============================================================
 */

export const knowledgebase = {

  // ─────────────────────────────────────────────────────────
  //  PROGRAM IDENTITY
  // ─────────────────────────────────────────────────────────

  summary:
    "Consumer Shield is a debt validation backend with fixed monthly payment tiers. " +
    "It is best for lower-balance debt validation scenarios and for prospects who want " +
    "a defined monthly payment structure instead of a settlement-style program.",

  serviceType: "Debt Validation",
  publicName:  "Debt Validation",
  internalName: "Consumer Shield",

  // ─────────────────────────────────────────────────────────
  //  PROGRAM MINIMUMS
  // ─────────────────────────────────────────────────────────

  minimums: {
    totalDebt: 4000,
    priorityRoutingMaxDebt: 6000,
    minimumAccountBalance: 100,
    notes: [
      "Total enrolled debt must be at least $4,000.",
      "Each individual account balance must be at least $100.",
      "Deals from $4,000–$6,000 route to Consumer Shield as the primary option.",
      "Deals above $6,000 may route to Consumer Shield as a fallback when other backends are unavailable."
    ]
  },

  // ─────────────────────────────────────────────────────────
  //  STATE RULES
  // ─────────────────────────────────────────────────────────

  stateRules: {
    blackoutStates: ["NC", "PA", "CO", "WA", "CT", "NJ", "OR", "TX"],
    blackoutNote:
      "Consumer Shield cannot service clients in blackout states. If the state is blacked out, the deal cannot be routed to Consumer Shield under any circumstances.",
    serviceableRule:
      "All states not listed as blackout are serviceable for Consumer Shield."
  },

  // ─────────────────────────────────────────────────────────
  //  PROGRAM STRUCTURE
  // ─────────────────────────────────────────────────────────

  programStructure: {
    description:
      "Consumer Shield uses fixed monthly payment tiers based on total enrolled debt. " +
      "The monthly payment and term are determined by the matching program band. " +
      "Payments and terms are fixed — they do not vary based on creditor negotiation.",
    supportHours: "Monday–Friday, 9:00 AM – 7:00 PM EST",
    supportTimezone: "America/New_York",
    creditPull: "Equifax",
    programType:
      "Debt Validation — challenges creditor, collector, and credit reporting records for accuracy and compliance."
  },

  // ─────────────────────────────────────────────────────────
  //  PROGRAM TIERS (PAYMENT BANDS)
  // ─────────────────────────────────────────────────────────

  programs: [
    { code: "A", range: "$4,000–$4,999",   minDebt: 4000,  maxDebt: 4999,      monthlyPayment: 220, term: 18, totalCost: 3960,  commission: { p2: 150, p4: 0,   total: 150 } },
    { code: "B", range: "$5,000–$8,799",   minDebt: 5000,  maxDebt: 8799,      monthlyPayment: 220, term: 24, totalCost: 5280,  commission: { p2: 150, p4: 0,   total: 150 } },
    { code: "C", range: "$8,800–$9,999",   minDebt: 8800,  maxDebt: 9999,      monthlyPayment: 220, term: 36, totalCost: 7920,  commission: { p2: 150, p4: 0,   total: 150 } },
    { code: "D", range: "$10,000–$14,999", minDebt: 10000, maxDebt: 14999,     monthlyPayment: 270, term: 36, totalCost: 9720,  commission: { p2: 175, p4: 50,  total: 225 } },
    { code: "E", range: "$15,000–$19,999", minDebt: 15000, maxDebt: 19999,     monthlyPayment: 320, term: 36, totalCost: 11520, commission: { p2: 200, p4: 75,  total: 275 } },
    { code: "F", range: "$20,000–$24,999", minDebt: 20000, maxDebt: 24999,     monthlyPayment: 370, term: 36, totalCost: 13320, commission: { p2: 250, p4: 100, total: 350 } },
    { code: "G", range: "$25,000–$29,999", minDebt: 25000, maxDebt: 29999,     monthlyPayment: 420, term: 36, totalCost: 15120, commission: { p2: 300, p4: 100, total: 400 } },
    { code: "H", range: "$30,000–$49,999", minDebt: 30000, maxDebt: 49999,     monthlyPayment: 520, term: 36, totalCost: 18720, commission: { p2: 375, p4: 125, total: 500 } },
    { code: "I", range: "$50,000+",        minDebt: 50000, maxDebt: Infinity,  monthlyPayment: 620, term: 36, totalCost: null,  commission: { p2: 450, p4: 150, total: 600 } },
  ],

  getProgram(totalDebt) {
    return this.programs.find(
      (p) => totalDebt >= p.minDebt && totalDebt <= p.maxDebt
    ) || null;
  },

  // ─────────────────────────────────────────────────────────
  //  ACCEPTED DEBT TYPES
  // ─────────────────────────────────────────────────────────

  acceptedDebtTypes: [
    "Unsecured Credit Card",
    "Unsecured Personal Loan",
    "Unsecured Line of Credit",
    "Medical Bill",
    "Payday Loan",
    "Cell Phone Bill",
    "Utility Bill (in collections)",
    "Gas Card",
    "Department Store Card",
    "Private Student Loan (conditional — verify not federal)"
  ],

  // ─────────────────────────────────────────────────────────
  //  CONDITIONAL DEBT TYPES
  // ─────────────────────────────────────────────────────────

  conditionalDebtTypes: [
    { type: "USAA",                              rule: "USAA accounts are conditional — documentation required." },
    { type: "Deficiency Balance",                rule: "Must be in 3rd party collections." },
    { type: "Repossession Deficiency",           rule: "Must be in 3rd party collections." },
    { type: "Auto Repo Deficiency",              rule: "Must be in 3rd party collections." },
    { type: "Tribal Loan",                       rule: "Must verify no wage assignment before enrolling." },
    { type: "Business Debt",                     rule: "Must be in 3rd party collections." },
    { type: "Judgment",                          rule: "Debt must be enrolled prior to judgment date." },
    { type: "Apartment Back Rent (Collections)", rule: "Must be in collections. Client must no longer be living in the unit." },
    { type: "Private Student Loan",              rule: "Verify it is truly private (not federal) before enrolling." },
  ],

  // ─────────────────────────────────────────────────────────
  //  REJECTED DEBT TYPES
  // ─────────────────────────────────────────────────────────

  rejectedDebtTypes: [
    "Timeshare",
    "Mortgage",
    "Home Equity Loan",
    "Home Equity Line of Credit (HELOC)",
    "Federal Student Loan",
    "IRS Tax Debt",
    "State Tax Debt",
    "Tax Lien",
    "Cross Collateralized Account",
    "Furniture Store Financing",
    "Direct Furniture Store Loan",
    "Loan from Individual",
    "Installment Sales Contract",
    "Retail Installment Contract",
    "Credit Union Loan",
    "Military Account",
    "AFES Account",
    "VA Loan",
    "SBA Loan",
    "Auto Loan (Secured)",
    "Secured Loan",
    "Wage Garnishment",
    "Alimony",
    "Child Support",
    "Casino Debt",
    "Government Citation / Fine / Ticket",
  ],

  // ─────────────────────────────────────────────────────────
  //  REJECTED NAMED CREDITORS
  // ─────────────────────────────────────────────────────────

  rejectedCreditors: [
    // Military / Government
    { name: "Military Star",              aliases: ["Exchange Credit Program", "AFES", "AAFES"],        reason: "Military / AFES account" },
    { name: "VA Loans",                   aliases: ["Veterans Affairs Loan"],                            reason: "Government-backed / secured" },
    { name: "SBA Loans",                  aliases: ["Small Business Administration"],                    reason: "Government-backed business loan" },
    // Solar / Home Improvement
    { name: "GoodLeap",                   aliases: ["LoanPal", "Loan Pal", "GoodLeap LLC"],              reason: "Solar / home improvement — secured to property" },
    { name: "Solar Mosaic",               aliases: ["Mosaic", "Mosaic Solar"],                           reason: "Solar financing — secured to property" },
    { name: "Aqua Finance",               aliases: ["AquaFinance"],                                      reason: "HVAC / home improvement financing" },
    { name: "EnerBank",                   aliases: ["EnerBank USA"],                                     reason: "Home improvement financing" },
    { name: "Service Finance Company",    aliases: ["SVCFIN", "SRVFINCO"],                               reason: "HVAC / home improvement financing" },
    { name: "PowerPay",                   aliases: ["Power Pay"],                                        reason: "Home improvement financing" },
    { name: "GreenSky",                   aliases: ["Green Sky"],                                        reason: "Home improvement financing" },
    // Auto / Vehicle-secured
    { name: "Yendo",                      aliases: [],                                                   reason: "Vehicle-equity credit card — secured to title" },
    { name: "Toledo Finance",             aliases: ["Toledo Financial"],                                  reason: "Auto / subprime financing" },
    // Rent-to-Own / POS
    { name: "Rent-A-Center",              aliases: ["RAC", "RentACenter"],                               reason: "Rent-to-own — not traditional unsecured debt" },
    { name: "Acceptance Now",             aliases: ["AcceptanceNow"],                                    reason: "Rent-to-own" },
    { name: "Acima",                      aliases: ["Acima Credit", "Acima Digital"],                    reason: "Lease-to-own / POS financing" },
    { name: "Koalafi",                    aliases: [],                                                   reason: "Lease-to-own / POS financing" },
    { name: "Farmers Furniture",          aliases: ["FRMRS FURN"],                                      reason: "Rent-to-own furniture" },
    // Retail Furniture
    { name: "Bob's Discount Furniture",   aliases: ["Bobs Finance", "Bobs Furniture"],                  reason: "Retail furniture installment contract" },
    { name: "Nebraska Furniture Mart",    aliases: ["NFM"],                                             reason: "Retail furniture installment contract" },
    // Tool / Equipment Financing
    { name: "Snap-On Credit",             aliases: ["Snapon Credit", "Snap On Tools Credit"],           reason: "Tool dealer financing — secured" },
    { name: "West Creek Financial",       aliases: ["WestCreek Financial"],                             reason: "Subprime secured consumer financing" },
    // Named Credit Unions
    { name: "State Employees CU",         aliases: ["SECU", "STATEEMP", "STATE EMPLOYEES C U"],         reason: "Credit union — all state variants" },
    { name: "Empower FCU",                aliases: ["Empower Federal Credit Union"],                    reason: "Credit union" },
    { name: "ESL Credit Union",           aliases: ["ESL FCU"],                                         reason: "Credit union" },
    { name: "Redstone CU",                aliases: ["Redstone Federal Credit Union"],                   reason: "Credit union" },
    { name: "Fortera Credit Union",       aliases: ["Fortera FCU"],                                     reason: "Credit union" },
    { name: "Local Government FCU",       aliases: ["LGFCU"],                                           reason: "Credit union" },
    { name: "Garden FCU",                 aliases: ["Garden Federal Credit Union"],                     reason: "Credit union" },
    { name: "Golden One CU",              aliases: ["Golden 1 Credit Union"],                           reason: "Credit union" },
    { name: "Hawaii CU",                  aliases: ["HCU"],                                             reason: "Credit union" },
    { name: "WSECU",                      aliases: ["Washington State Employees CU"],                   reason: "Credit union" },
    // Credit Builder
    { name: "KIKOFF",                     aliases: [],                                                  reason: "Credit builder — not traditional debt" },
    { name: "OpenSky",                    aliases: ["Open Sky"],                                        reason: "Secured credit card" },
    // MLM / Direct Sales
    { name: "HC Roya / Royal Prestige",   aliases: ["HyCite", "HC Royal", "Regal Ware"],               reason: "MLM / direct sales — not traditional debt" },
    // Regional / PR
    { name: "Island Finance",             aliases: ["Island Finance PR"],                               reason: "Puerto Rico consumer finance" },
    { name: "Popular Bank",               aliases: ["Banco Popular"],                                   reason: "Puerto Rico commercial bank" },
    // Goldman Sachs CC only (not loans or Apple Card)
    { name: "Goldman Sachs Credit Card",  aliases: ["Marcus Credit Card", "Marcus by Goldman Sachs"],  reason: "GS credit cards not accepted — Apple Card and GS personal loans ARE accepted" },
    // BHG
    { name: "BHG Financial",              aliases: ["BHG Money", "Bankers Healthcare Group"],           reason: "All BHG entities not accepted" },
    // Other
    { name: "Pinnacle Financial Group",   aliases: ["Pinnacle Financial"],                              reason: "Consumer finance company" },
    { name: "Concord Servicing",          aliases: ["Concord Servicing Corp"],                          reason: "Loan servicer" },
    { name: "Credologi",                  aliases: ["Credologi LLC"],                                   reason: "Debt relief / personal lender" },
    { name: "Kabbage",                    aliases: ["Kabbage Loans", "AmEx Business Blueprint"],        reason: "Small business lending" },
    { name: "Robinhood",                  aliases: ["Robinhood Financial"],                             reason: "Investment / brokerage — not a debt" },
    { name: "Alleviate Tax",              aliases: ["Alleviate Tax LLC"],                               reason: "Tax relief firm — not an enrollable creditor" },
  ],

  // ─────────────────────────────────────────────────────────
  //  CONDITIONAL NAMED CREDITORS
  // ─────────────────────────────────────────────────────────

  conditionalCreditors: [
    { name: "USAA",              aliases: ["USAA Federal Savings Bank"],   rule: "Documentation required." },
    { name: "Lendmark",          aliases: ["Lendmark Financial Services"], rule: "Unsecured accounts only — secured NOT accepted. Verify before enrolling." },
    { name: "Mariner Finance",   aliases: ["Mariner Financial"],           rule: "Unsecured accounts only — secured NOT accepted. Verify before enrolling." },
    { name: "OneMain Financial", aliases: ["OneMain", "One Main"],         rule: "Unsecured accounts only — secured NOT accepted. Verify before enrolling." },
    { name: "Regional Finance",  aliases: ["Regional Management"],         rule: "Unsecured accounts only — secured NOT accepted. Verify before enrolling." },
    { name: "Republic Finance",  aliases: ["Republic Finance LLC"],        rule: "Unsecured accounts only — secured NOT accepted. Verify before enrolling." },
  ],

  // ─────────────────────────────────────────────────────────
  //  ROUTING GUIDANCE
  // ─────────────────────────────────────────────────────────

  routingGuidance: {
    primaryRule:
      "Deals from $4,000 to $6,000 route to Consumer Shield when the state is serviceable and debt types qualify.",
    secondaryRule:
      "For debt above $6,000, Consumer Shield is a fallback when Legacy / ELP or Level Debt are unavailable or ineligible.",
    fallbackRule:
      "If Consumer Shield is unavailable due to state blackout or debt type exclusions, the outcome is No Option.",
    debtValidationPreference:
      "If a prospect specifically wants debt validation over settlement, Consumer Shield is the appropriate route regardless of amount (within state and eligibility rules)."
  },

  // ─────────────────────────────────────────────────────────
  //  POSITIONING
  // ─────────────────────────────────────────────────────────

  positioning: {
    bestFor: [
      "Prospects with $4,000–$6,000 in enrolled debt",
      "Prospects who want debt validation instead of settlement",
      "Prospects who want a fixed monthly payment with a defined term",
      "Prospects in states where Level Debt or Legacy / ELP are unavailable",
      "Prospects who want a predictable structure without settlement risk"
    ],
    notFor: [
      "Prospects in blackout states: NC, PA, CO, WA, CT, NJ, OR, TX",
      "Prospects with excluded debt types or named creditors",
      "Prospects specifically wanting debt settlement",
      "Prospects wanting attorney-led legal representation",
      "Prospects with total enrolled debt below $4,000"
    ]
  },

  // ─────────────────────────────────────────────────────────
  //  COMPLIANCE
  // ─────────────────────────────────────────────────────────

  compliance: {
    programType: "Consumer Shield is a debt validation program — NOT debt settlement.",
    requiredDisclosures: [
      "Consumer Shield is a debt validation program, not debt settlement.",
      "Results vary depending on the account and creditor response.",
      "Not all debts qualify for the program.",
      "No specific outcome can be guaranteed.",
      "Program uses Equifax for the credit pull."
    ],
    prohibitedClaims: [
      "Guaranteed removal",
      "Guaranteed results",
      "We will erase your debt",
      "This fixes your credit",
      "Instant deletion",
      "You are approved",
      "Your debt will be eliminated",
      "Creditors will agree to settle",
      "This is the same as settling your debt"
    ],
    approvedPhrases: [
      "Debt validation program",
      "Fixed monthly payment",
      "Results vary",
      "Not all debts qualify",
      "Legal challenge process",
      "Defined monthly payment structure",
      "Organized approach to managing unsecured debt"
    ]
  },

  // ─────────────────────────────────────────────────────────
  //  AGENT NOTES
  // ─────────────────────────────────────────────────────────

  agentNotes: {
    quickPitch:
      "Consumer Shield is the best fit when the prospect wants debt validation with a fixed monthly payment and a defined term — no surprises, no settlement risk.",
    salesAngle:
      "Position it as structured, predictable, and validation-focused. " +
      "Emphasize the fixed payment and defined end date for prospects who want clarity.",
    caution:
      "Do not present Consumer Shield as debt settlement. " +
      "Do not say Consumer Shield will settle debts or reduce balances. " +
      "Always clarify it is a debt validation program.",
    creditPullNote:
      "Consumer Shield uses Equifax for its credit pull. If a prospect has a frozen Equifax file, they must thaw it before enrollment.",
    supportContact:
      "For Consumer Shield backend support, use the Teams channel during support hours: Monday–Friday, 9:00 AM – 7:00 PM EST."
  }
};
