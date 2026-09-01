/**
 * ============================================================
 *  LEGACY CAPITAL SERVICES / ELITE LEGAL PRACTICE
 *  knowledgebase.js — Debt Acceptance & Routing Reference
 * ============================================================
 *  Use this module as the single source of truth for:
 *    - Enrollment eligibility checks
 *    - Debt type routing decisions
 *    - Lender/company acceptance lookups
 *    - Stipulation enforcement
 *    - Support contact resolution
 *
 *  Last updated: September 1, 2026
 *  Previous revision: September 22, 2025
 *
 *  SOURCE OF RECORD
 *    "Elite Legal Practice — Acceptable Debts 2026"
 *    Document owner: Sara Mitz, Affiliate Support Manager
 *    Tabs: Debt List | Excluded Companies | Included Companies
 *
 *  TWO RULES THAT GOVERN EVERYTHING BELOW
 *
 *  1. DEBT TYPE OUTRANKS THE LENDER LIST.
 *     ELP's lender lists are NOT exhaustive. If a debt type is
 *     ineligible, it stays ineligible even when the lender does
 *     not appear on the excluded list. Never return ACCEPT just
 *     because a lender is unlisted.
 *
 *  2. LENDER NAMES ARE MATCHED ONE-FOR-ONE.
 *     Every name on the excluded and included lists is a distinct
 *     legal entity. "Lake Lending" is NOT "Willow Lake Lending".
 *     "Velocity Recoveries" is NOT "Velocity Lending Solution".
 *     Matching is exact on a normalized string, plus an explicit
 *     alias list. There is no substring fallback. See matchCompany().
 *
 *  3. DEBT TYPES AND COMPANY NAMES ARE TWO SEPARATE LAYERS.
 *     ACCEPTABLE_DEBTS / UNACCEPTABLE_DEBT_TYPES hold debt categories and
 *     are matched against the DEBT TYPE only. COMPANIES_ACCEPTED /
 *     COMPANIES_NOT_ACCEPTED hold named entities and are matched against
 *     the CREDITOR NAME only. Never query one with the other. Both layers
 *     are evaluated on every lookup and a rejection in either one rejects
 *     the account, so an accepted lender carrying an ineligible debt type
 *     is still ineligible, and an eligible debt type from an excluded
 *     lender is still excluded.
 *
 *  4. 3RD PARTY COLLECTIONS IS A CHECKABLE CONDITION, NOT A WARNING.
 *     Business debt, auto loans/repos, merchant cash advances and
 *     timeshares are enrollable ONLY in verified 3rd party collections.
 *     Pass `inThirdPartyCollections` to enrollmentEligibilityCheck():
 *       true      → the condition is satisfied, the account clears
 *       false     → hard blocker
 *       undefined → CONDITIONAL, the agent must answer it
 * ============================================================
 */

export const KB_REVISION = {
  revision: "2026-09-01",
  previousRevision: "2025-09-22",
  sourceDocument: "Elite Legal Practice — Acceptable Debts 2026",
  documentOwner: "Sara Mitz, Affiliate Support Manager",
  partner: "Elite Legal Practice (ELP)",
  affiliate: "Legacy Capital Services",
};

// ─────────────────────────────────────────────────────────────
//  1. PROGRAM MINIMUMS
// ─────────────────────────────────────────────────────────────

export const PROGRAM_MINIMUMS = {
  minimumDebtLoad:       6000,  // Total enrolled debt minimum ($)
  minimumClientPayment:  250,   // Minimum monthly client payment ($)
  minimumAccountBalance: 100,   // Minimum single account balance ($)
};

// ─────────────────────────────────────────────────────────────
//  2. RESTRICTED STATES
//     Cannot accept clients or debts from these states.
// ─────────────────────────────────────────────────────────────

export const RESTRICTED_STATES = ["ID", "ND", "GA"];

// ─────────────────────────────────────────────────────────────
//  3. LEGAL REPRESENTATION FEES
//     Applies to Judgments, Lawsuits and Summons ONLY.
//
//     The client must already be enrolled. ELP does not accept a
//     judgment, lawsuit or summons that existed BEFORE enrollment
//     under any circumstance — that is a hard reject, not a fee.
//
//     $675  the client is enrolled AND the legal action is received
//           within the first year of enrollment
//     $850  the specific debt being sued on was never enrolled
//           (client is enrolled, that debt is not)
//     Either tier may be spread over 2 months.
// ─────────────────────────────────────────────────────────────

export const LEGAL_FEES = {
  appliesTo: ["Judgments", "Lawsuits", "Summons"],
  enrolledWithinFirstYear: 675,
  debtNotEnrolled: 850,
  spreadMonths: 2,
  preEnrollmentAccepted: false,
  previousFlatFee: 650, // superseded 2026-09-01 — do not quote
};

/**
 * Resolve the legal representation fee for a judgment / lawsuit / summons.
 * @param {object} params
 * @param {boolean} params.clientEnrolled     Client is enrolled in the program.
 * @param {boolean} params.debtEnrolled       The specific debt being sued on is enrolled.
 * @param {boolean} params.receivedPreEnrollment  Legal action predates enrollment.
 * @param {number}  [params.monthsSinceEnrollment]
 * @returns {{ status:"REJECT"|"FEE", fee:number|null, spreadMonths:number|null, reason:string }}
 */
export function getLegalFee({
  clientEnrolled,
  debtEnrolled,
  receivedPreEnrollment,
  monthsSinceEnrollment,
} = {}) {
  if (receivedPreEnrollment || clientEnrolled === false) {
    return {
      status: "REJECT",
      fee: null,
      spreadMonths: null,
      reason:
        "The client must be enrolled BEFORE the judgment, lawsuit or summons is received. Pre-enrollment legal actions are not accepted by ELP.",
    };
  }
  if (debtEnrolled === false) {
    return {
      status: "FEE",
      fee: LEGAL_FEES.debtNotEnrolled,
      spreadMonths: LEGAL_FEES.spreadMonths,
      reason:
        "The debt being sued on was never enrolled. $850 legal representation fee, may be spread over 2 months.",
    };
  }
  const withinFirstYear =
    monthsSinceEnrollment === undefined || monthsSinceEnrollment === null
      ? true
      : monthsSinceEnrollment <= 12;
  if (withinFirstYear) {
    return {
      status: "FEE",
      fee: LEGAL_FEES.enrolledWithinFirstYear,
      spreadMonths: LEGAL_FEES.spreadMonths,
      reason:
        "Enrolled debt, legal action received within the first year of enrollment. $675 legal representation fee, may be spread over 2 months.",
    };
  }
  return {
    status: "FEE",
    fee: LEGAL_FEES.enrolledWithinFirstYear,
    spreadMonths: LEGAL_FEES.spreadMonths,
    reason:
      "Enrolled debt, legal action received after the first year of enrollment. ELP has not published a rate for this case — confirm with Affiliate Support before quoting.",
    needsConfirmation: true,
  };
}

// ─────────────────────────────────────────────────────────────
//  4. INELIGIBLE DEBT TYPES THAT OUTRANK THE LENDER LIST
//
//     Per ELP (Sept 2026): "While some lenders may not appear on
//     the Unaccepted Lender List, the debt type itself is
//     ineligible. All individual lenders may not be specifically
//     listed."
//
//     If a debt matches one of these, it is rejected regardless of
//     whether the lender is on any list — including UNKNOWN lenders.
// ─────────────────────────────────────────────────────────────

export const GOVERNING_INELIGIBLE_TYPES = [
  {
    key: "TRIBAL",
    label: "Tribal Loans",
    aliases: ["tribal", "tribal loan", "tribal loans", "tribal lender", "tribal lending"],
    reason: "Tribal loans are ineligible for ELP regardless of lender.",
  },
  {
    key: "HOME_IMPROVEMENT",
    label: "Home Improvement Loans",
    aliases: [
      "home improvement", "home improvement loan", "home improvement loans",
      "roofing loan", "roof financing", "window financing", "kitchen remodel loan",
      "structural attachment", "hvac loan",
    ],
    reason:
      "Home improvement loans and structural attachments are ineligible for ELP regardless of lender.",
  },
  {
    key: "STUDENT",
    label: "Student Loans",
    aliases: ["student loan", "student loans", "federal student loan", "private student loan", "education loan"],
    reason: "Student loans (federal or private) are ineligible for ELP regardless of lender.",
  },
];

/**
 * Consolidation is handled separately — it is NOT a clean blanket reject.
 *
 * ELP's Sept 2026 verbal guidance says "consolidation loans are not accepted",
 * but the same spreadsheet explicitly ACCEPTS "Consolidation/Negotiation Loans"
 * and "Transform Credit / Together Loans" when they are not issued by a debt
 * settlement company and are $3,000 or more.
 *
 * Until ELP resolves that in writing, consolidation returns CONDITIONAL with a
 * mandatory confirmation step. It never auto-accepts and it never auto-rejects.
 * See PENDING_ELP_CONFIRMATION below.
 */
export const CONSOLIDATION_RULE = {
  key: "CONSOLIDATION",
  label: "Consolidation / Negotiation Loans",
  aliases: [
    "consolidation loan", "consolidation loans", "debt consolidation",
    "negotiation loan", "negotiation loans", "consolidation/negotiation loans",
  ],
  status: "CONDITIONAL",
  requiresConfirmation: true,
  stipulations:
    "Must NOT be issued by a debt settlement company. No loans under $3,000. No monthly memberships.",
  warning:
    "CONFLICT — ELP guidance (Sept 2026) states consolidation loans are not accepted, but the same document accepts Consolidation/Negotiation Loans and Transform Credit at $3,000+. Confirm with Affiliate Support before enrolling.",
};

// ─────────────────────────────────────────────────────────────
//  5. ACCEPTABLE DEBT TYPES
// ─────────────────────────────────────────────────────────────

export const ACCEPTABLE_DEBTS = [
  {
    type: "3rd Party Collections",
    stipulations: "Excludes student loans and 3rd party tribal loans.",
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Alarm Systems",
    alternateNames: ["Alarm System", "ADT Alarm System", "ADT"],
    stipulations: "System may need to be removed due to its age. Note this with the client.",
    requiresNote: true,
    noteText: "Client is aware the system may be removed.",
    requiresSalesforceAction: false,
  },
  {
    type: "Auto Loans & Repossessions",
    alternateNames: ["Auto Loans", "RV Loans", "Motorcycle Loans", "Leases", "Repos", "Repossessions"],
    stipulations: "MUST BE IN 3RD PARTY COLLECTIONS ONLY. Cannot accept deficiency loans.",
    mustBeInCollections: true,
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Back Rent",
    stipulations: "Client must no longer be living in the rental unit.",
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Business Debts",
    alternateNames: ["Business Loans", "Business Credit Cards", "Business Debts/Loans"],
    stipulations: "MUST BE IN 3RD PARTY COLLECTIONS ONLY. Business debt not in 3rd party collections is rejected.",
    mustBeInCollections: true,
    conditional: true,
    requiresNote: false,
    requiresSalesforceAction: false,
    revisionNote:
      "2026-09-01: Debt List tab lists business debt as not accepted; Included Companies tab accepts it in 3rd party collections. Resolved in favor of 3rd-party-collections-only per ELP.",
  },
  {
    type: "Cash Advances",
    alternateNames: ["Cash Advance"],
    stipulations: null,
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Certificates of Deposit (CDs)",
    alternateNames: ["Certificate of Deposit", "CD", "CDs"],
    stipulations: "Right to offset note required.",
    requiresNote: true,
    noteText: "Right to offset note recorded.",
    requiresSalesforceAction: false,
    addedInRevision: "2026-09-01",
  },
  {
    type: "Check Cashing Debts",
    alternateNames: ["Check Cashing"],
    stipulations: null,
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Consolidation/Negotiation Loans",
    alternateNames: ["Consolidation Loans", "Negotiation Loans"],
    stipulations:
      "Must NOT be issued by a debt settlement company. No Transform Credit loans under $3,000. No monthly memberships.",
    conditional: true,
    requiresConfirmation: true,
    confirmationReason: CONSOLIDATION_RULE.warning,
    minimumBalance: 3000,
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Credit Builder Loans",
    stipulations: "Add Cross Collateral / Repo Note in Salesforce.",
    requiresNote: false,
    requiresSalesforceAction: true,
    salesforceAction: "Add Cross Collateral / Repo Note",
  },
  {
    type: "Credit Unions & Federal Banks",
    alternateNames: ["Credit Unions / Federal", "Credit Union", "Federal Bank"],
    stipulations: "Add Cross Collateral / Repo Note in Salesforce.",
    requiresNote: false,
    requiresSalesforceAction: true,
    salesforceAction: "Add Cross Collateral / Repo Note",
  },
  {
    type: "Department Store Cards",
    alternateNames: ["Department Stores"],
    stipulations: "Add Repo Note in Salesforce.",
    requiresNote: false,
    requiresSalesforceAction: true,
    salesforceAction: "Add Repo Note",
  },
  {
    type: "Furniture & Jewelry Loans",
    alternateNames: ["Furniture Loans", "Jewelry Loans", "Furniture and/or Jewelry", "Backyard Accessories"],
    stipulations:
      "Covers furniture, backyard accessories and jewelry. Repo note required. Must not be part of the original title/lien holder.",
    requiresNote: false,
    requiresSalesforceAction: true,
    salesforceAction: "Add Repo Note",
  },
  {
    type: "Gas Station Cards",
    alternateNames: ["Gas Cards"],
    stipulations: null,
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Gym & Fitness Memberships",
    alternateNames: ["Gyms / Fitness Centers", "Gym Membership", "Fitness Center"],
    stipulations: "If disputed, the client should understand they may lose the membership.",
    requiresNote: true,
    noteText: "Client understands they may lose their membership.",
    requiresSalesforceAction: false,
  },
  {
    type: "Health Club Memberships",
    alternateNames: ["Health Clubs", "Health Club"],
    stipulations: "If disputed, the client should understand they may lose the membership.",
    requiresNote: true,
    noteText: "Client understands they may lose their membership.",
    requiresSalesforceAction: false,
  },
  {
    type: "Installment & Note Loans",
    alternateNames: ["Installment Loans", "Note Loans", "Installment Loans / Note Loans"],
    stipulations:
      "Cannot be issued by a debt settlement company. Add Cross Collateral / Repo Note in Salesforce.",
    requiresNote: false,
    requiresSalesforceAction: true,
    salesforceAction: "Add Cross Collateral / Repo Note",
  },
  {
    type: "Judgments",
    alternateNames: ["Judgements", "Judgment"],
    stipulations:
      "Client must be enrolled PRIOR to receiving the judgment. $675 legal fee if received within the first year of enrollment on an enrolled debt; $850 if the debt itself is not enrolled. Either may be spread over 2 months.",
    mustBePostEnrollment: true,
    usesLegalFeeSchedule: true,
    legalFeeEnrolledWithinFirstYear: 675,
    legalFeeDebtNotEnrolled: 850,
    legalFeeSpreadMonths: 2,
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Lawsuits",
    stipulations:
      "Client must be enrolled PRIOR to receiving the lawsuit. $675 legal fee if received within the first year of enrollment on an enrolled debt; $850 if the debt itself is not enrolled. Either may be spread over 2 months.",
    mustBePostEnrollment: true,
    usesLegalFeeSchedule: true,
    legalFeeEnrolledWithinFirstYear: 675,
    legalFeeDebtNotEnrolled: 850,
    legalFeeSpreadMonths: 2,
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Summons",
    stipulations:
      "Client must be enrolled PRIOR to receiving the summons. $675 legal fee if received within the first year of enrollment on an enrolled debt; $850 if the debt itself is not enrolled. Either may be spread over 2 months.",
    mustBePostEnrollment: true,
    usesLegalFeeSchedule: true,
    legalFeeEnrolledWithinFirstYear: 675,
    legalFeeDebtNotEnrolled: 850,
    legalFeeSpreadMonths: 2,
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Lending Club Loans",
    alternateNames: ["Lending Club", "LendingClub"],
    stipulations: "Must be unsecured — not tied to collateral and not tied to the home.",
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Lines of Credit",
    alternateNames: ["Line of Credit", "Lines of Unsecured Credit"],
    stipulations:
      "Must function like a credit card. Provide the first page of the statement showing client and billing information.",
    documentRequired: "First page of statement with client and billing info",
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Medical Debt",
    stipulations:
      "First page of the statement required showing client and billing details. Client must NOT be receiving ongoing treatment.",
    documentRequired: "First page of statement with client and billing info",
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Merchant Cash Advances",
    alternateNames: ["Merchant Cash Advance Loans", "MCA"],
    stipulations: "MUST BE IN 3RD PARTY COLLECTIONS ONLY.",
    mustBeInCollections: true,
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Military Credit Unions",
    stipulations: "Excludes Military Star, Pioneer Loans, BX Omni and VA Loans.",
    excludedLenders: ["Military Star", "Pioneer Loans", "BX Omni", "VA Loans"],
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Military Loans",
    stipulations:
      "Must NOT be government-endorsed. Verify the client is not currently active military and does not have or require secret / top secret clearance.",
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Online Buy Now / Pay Later",
    alternateNames: ["Online Buy Now - Pay Later", "BNPL", "Affirm", "Afterpay", "Klarna", "Online Payback Programs"],
    stipulations:
      "Clear screenshot of the balance is acceptable. Check for a wage assignment clause before enrolling.",
    checkWageAssignment: true,
    documentRequired: "Clear screenshot of current balance",
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Payday Loans",
    stipulations: "Check for wage assignment clauses before enrolling.",
    checkWageAssignment: true,
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Personal Loans",
    alternateNames: ["Personal Credit Cards"],
    stipulations: "Must be unsecured — not tied to collateral and not tied to the home.",
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Signature Loans",
    stipulations: "Must be unsecured — not tied to collateral and not tied to the home.",
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Timeshares",
    alternateNames: ["Timeshare"],
    stipulations: "MUST BE IN 3RD PARTY COLLECTIONS ONLY.",
    mustBeInCollections: true,
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Transform Credit",
    alternateNames: ["Together Loans", "Transform Credit / Consolidation"],
    stipulations:
      "Not issued by a debt settlement company. No loans under $3,000. No monthly memberships.",
    minimumBalance: 3000,
    conditional: true,
    requiresConfirmation: true,
    confirmationReason: CONSOLIDATION_RULE.warning,
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Unsecured Credit Cards",
    stipulations: "Refer to the excluded companies list if there is any concern about a specific issuer.",
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Unsecured Debts (General)",
    alternateNames: ["Unsecured Debts", "Unsecured Debt"],
    stipulations:
      "Client should understand that service may be shut off if the debt is disputed. Must not be part of the original title/lien holder.",
    requiresNote: true,
    noteText: "Client is aware that service may be shut off.",
    requiresSalesforceAction: false,
  },
  {
    type: "Utility Bills",
    alternateNames: ["Power", "Internet", "Electric", "Cellular", "Cable", "Utilities"],
    stipulations:
      "Power, internet, electric, cellular and cable only. Must be OLD accounts that are not currently active. Client should understand service may be shut off if disputed.",
    mustBePreviousProvider: true,
    requiresNote: true,
    noteText: "Client is aware that service will be shut off.",
    requiresSalesforceAction: false,
  },
];

// ─────────────────────────────────────────────────────────────
//  6. UNACCEPTABLE DEBT TYPES
//     Source: "Debt List" tab — DEBTS WE DO NOT ACCEPT.
//     Entries marked retained:true were on the 2025-09-22 list and
//     are not on the new sheet. Per ELP the lender/type lists are
//     not exhaustive, so they are held rather than deleted.
// ─────────────────────────────────────────────────────────────

export const UNACCEPTABLE_DEBT_TYPES = [
  { type: "Agriculture Loans", addedInRevision: "2026-09-01" },
  { type: "Alimony" },
  { type: "Child Support" },
  { type: "Bankruptcy (during active bankruptcy)" },
  { type: "City Debts" },
  { type: "County Debts" },
  { type: "State Debts" },
  { type: "Federal Debts" },
  { type: "Debt Settlement Loans" },
  { type: "Home Equity Line of Credit (HELOC)" },
  { type: "Home Improvement Loans or Structural Attachments", governingType: "HOME_IMPROVEMENT" },
  { type: "Judgements (Pre-Enrollment)", note: "Post-enrollment judgments ARE accepted — see LEGAL_FEES." },
  { type: "Lawsuits (Pre-Enrollment)", note: "Post-enrollment lawsuits ARE accepted — see LEGAL_FEES." },
  { type: "Summons (Pre-Enrollment)", note: "Post-enrollment summons ARE accepted — see LEGAL_FEES." },
  { type: "Mortgages" },
  { type: "Home Loans" },
  { type: "Pioneer Loans" },
  { type: "Pools (or anything in ground)", addedInRevision: "2026-09-01" },
  { type: "Promissory Notes", note: "Falls under city/state debt.", addedInRevision: "2026-09-01" },
  {
    type: "Social Security Income (pre-enrollment)",
    note:
      "Social Security income the client receives AFTER the enrollment date is permissible; it is not eligible prior to enrollment.",
    addedInRevision: "2026-09-01",
  },
  {
    type: "Solar Panels",
    note:
      "Excluded even if detached. 3rd party collections may be acceptable for the debt type, BUT named solar lenders on the excluded list (e.g. GoodLeap) are never accepted under any circumstance.",
    thirdPartyCollectionsException: true,
  },
  { type: "Student Loans (Federal or Personal)", governingType: "STUDENT" },
  { type: "Tax Debts" },
  { type: "Tribal Loans", governingType: "TRIBAL" },
  { type: "VA Loans" },
  { type: "Wage Garnishments (Court Ordered)" },

  // ── Retained from the 2025-09-22 revision, not on the new sheet.
  { type: "Air Conditioning Units", retained: true },
  { type: "Business Inventory Outstanding Balances", retained: true },
  { type: "Citations", retained: true },
  { type: "Tickets", retained: true },
  { type: "Credit Builder Monthly Memberships", retained: true },
  { type: "Debt Negotiation Loans (issued by a debt settlement company)", retained: true },
  { type: "Mechanic's Liens Filed Against Property", retained: true },
  { type: "Spot Loans", retained: true },
];

// ─────────────────────────────────────────────────────────────
//  7. COMPANIES NOT ACCEPTED (ELP excluded lender list)
//     Matched ONE-FOR-ONE. Each name is a distinct legal entity.
//     Source: "Excluded Companies" tab, 2026-09-01.
// ─────────────────────────────────────────────────────────────

export const COMPANIES_NOT_ACCEPTED = [
  { company: "AES", reason: "Student Loan Provider", aliases: ["American Education Services"] },
  { company: "American Recovery System", reason: "Collateral Recovery", aliases: ["American Recovery Systems"] },
  { company: "Aqua Finance", reason: "Lending / Financing company" },
  { company: "Arrowhead Advance", reason: "Tribal Lender" },
  { company: "BHG", reason: "Business loan disguised as personal loan", aliases: ["Bankers Healthcare Group"] },
  { company: "Big Picture Loans", reason: "Tribal Lender" },
  { company: "Birch Lending", reason: "Tribal Lender" },
  { company: "Bison Cash", reason: "Tribal Lender" },
  { company: "Blue Mountain Loan", reason: "Tribal Lender" },
  { company: "Bonneville Collection", reason: "Collection Agency" },
  { company: "Boost Credit", reason: "Tribal Lender" },
  { company: "Bright Lending", reason: "Tribal Lender" },
  { company: "BX Omni", reason: "Excluded Military Lender" },
  { company: "Clear Air Lending", reason: "Tribal Lender" },
  { company: "Crane Lending", reason: "Tribal Lender" },
  { company: "Credit 9", reason: "Consumer Credit Lender" },
  { company: "Credit Cube", reason: "Tribal Lender" },
  { company: "E Loan Warehouse", reason: "Tribal Lender" },
  { company: "Eagle Advance", reason: "Tribal Lender" },
  { company: "Eagle Wing Funds", reason: "Investment / Lending Fund" },
  { company: "Elective Group USA", reason: "Federal Student Loan Provider", aliases: ["Elective Group"] },
  { company: "Eloan Warehouse", reason: "Tribal Lender" },
  { company: "Equity Sales Finance", reason: "Asset / Sales Finance" },
  { company: "Express Cash Flow", reason: "Business / Commercial Debt" },
  { company: "FIGURE TECH / FIGURE LENDING", reason: "Fintech Lending", aliases: ["Figure Tech", "Figure Lending", "Figure Technologies"] },
  { company: "Fineday Funds", reason: "Tribal Lender" },
  { company: "GoodLeap LLC", reason: "Solar / Clean Energy Finance", aliases: ["GoodLeap", "Good Leap", "GoodLeap Solar", "LoanPal", "Loan Pal"] },
  { company: "GRANITE", reason: "Student Loan Provider", aliases: ["Granite", "Granite State Management"] },
  { company: "Green Arrow Loans", reason: "Tribal Lender" },
  { company: "Greenline", reason: "Tribal Lender" },
  { company: "Hollis Cobb", reason: "Collection / Finance Company" },
  { company: "Home Equity Line of Credit", reason: "Home-Secured Debt", aliases: ["HELOC"] },
  { company: "Kadikorn Bank", reason: "Bank / Financial Institution" },
  { company: "Lendumo", reason: "Tribal Lender" },
  { company: "Level Up Funding", reason: "Tribal Lender" },
  { company: "LightStream", reason: "Excluded Loan Types" },
  { company: "Little Lake Lending", reason: "Tribal Lender" },
  { company: "Loan At Last", reason: "Tribal Lender" },
  { company: "Lookout Credit Union", reason: "Credit Union" },
  { company: "Makwa Finance", reason: "Tribal Lender" },
  { company: "Makwa Lending", reason: "Tribal Lender" },
  { company: "Mariner Finance", reason: "Installment Loans", aliases: ["Personal Finance Company"] },
  { company: "Maxlend", reason: "Tribal Lender" },
  { company: "Merit Financial Trust", reason: "Tribal Lender" },
  { company: "Military Star", reason: "Government-Backed Loans", aliases: ["Exchange Credit Program", "AAFES", "AFES"] },
  { company: "Minto Money", reason: "Tribal Lender" },
  { company: "MobiLoans LLC", reason: "Tribal Lender", aliases: ["MobiLoans", "Mobi Loans"] },
  { company: "MOHELA", reason: "Student Loan Provider", aliases: ["Mohela"] },
  { company: "Money Messiah", reason: "Tribal Lender" },
  { company: "My QuickWallet", reason: "Tribal Lender", aliases: ["MyQuickWallet"] },
  { company: "NAVIENT", reason: "Student Loan Provider", aliases: ["Navient"] },
  { company: "NCR Finance", reason: "Finance Company / Lender" },
  { company: "Night Wings Lending", reason: "Tribal Lender" },
  { company: "Opici Funds LLC", reason: "Tribal Lender", aliases: ["Opici Funds"] },
  { company: "Post Lake Lending", reason: "Tribal Lender" },
  { company: "Premier Loan Solutions", reason: "Tribal Lender" },
  { company: "Reach Financial", reason: "Consumer Finance" },
  { company: "Rise Up Lending", reason: "Tribal Lender" },
  { company: "River Valley Loans", reason: "Tribal Lender" },
  { company: "Sallie Mae Loans", reason: "Student Loan Provider", aliases: ["Sallie Mae"] },
  { company: "Same Day Credit", reason: "Tribal Lender" },
  { company: "SBA Loans", reason: "Government-Backed Small Business", aliases: ["SBA Loan", "Small Business Administration"] },
  { company: "Simple Fast Loans", reason: "Payday / Quick Consumer Lending" },
  { company: "Snap On Credit", reason: "Secured Loans Only" },
  { company: "Spotloan", reason: "Tribal Lender" },
  { company: "Sunbelt Federal Credit Union", reason: "Credit Union", aliases: ["Sunbelt FCU"] },
  { company: "Three Sticks Lending", reason: "Tribal Lender" },
  { company: "Tule Lake Lending", reason: "Tribal Lender" },
  { company: "Uprova", reason: "Tribal Lender" },
  { company: "Velocity Lending Solution", reason: "Business Loan Lender", aliases: ["Velocity Lending Solutions"] },
  { company: "White Pine Lending", reason: "Tribal Lender" },
  { company: "Willow Lake Lending", reason: "Tribal Lender" },
  { company: "WithU Loans", reason: "Tribal Lender" },
  { company: "Write St. Education Liens", reason: "Education Finance / Lien Recording", aliases: ["Write St Education Liens", "Wright St. Education Liens"] },
  { company: "Yendo", reason: "Auto Lender" },
  { company: "ZipLoan", reason: "Student / Consumer Loan Provider", aliases: ["Zip Loan"] },
  { company: "Zuntafi", reason: "Student / Consumer Loan Provider" },

  // ── Retained from the 2025-09-22 revision. These lenders are NOT on
  //    ELP's new list, but their debt TYPE is ineligible, and ELP has
  //    confirmed the lender list is not exhaustive. Held as excluded.
  { company: "Climb Loans", reason: "Student loan lender — student loans are an ineligible debt type regardless of lender listing.", governingType: "STUDENT", retainedFromPreviousRevision: true },
  { company: "GreenSky", reason: "Home improvement financing — home improvement loans are an ineligible debt type regardless of lender listing.", governingType: "HOME_IMPROVEMENT", retainedFromPreviousRevision: true },
  { company: "Today Cash", reason: "Tribal lender — tribal loans are an ineligible debt type regardless of lender listing.", governingType: "TRIBAL", retainedFromPreviousRevision: true },
  { company: "Versara Lending", reason: "Consolidation / negotiation lender — see CONSOLIDATION_RULE. Held as excluded pending ELP written confirmation.", governingType: "CONSOLIDATION", retainedFromPreviousRevision: true },
];

// ─────────────────────────────────────────────────────────────
//  8. COMPANIES ACCEPTED (named lenders only)
//     Debt TYPES live in ACCEPTABLE_DEBTS above — this list is
//     only for specific named entities on ELP's included list.
//     Matched ONE-FOR-ONE. "Lake Lending" is a distinct company
//     and is NOT related to Little / Post / Tule / Willow Lake
//     Lending, all of which are excluded tribal lenders.
// ─────────────────────────────────────────────────────────────

export const COMPANIES_ACCEPTED = [
  { company: "ADT Alarm System", aliases: ["ADT"], exceptions: "System may need removal based on age. Note client awareness." },
  { company: "Lake Lending", exceptions: "Unsecured debt only.", distinctFrom: ["Little Lake Lending", "Post Lake Lending", "Tule Lake Lending", "Willow Lake Lending"] },
  { company: "Lending Club", aliases: ["LendingClub"], exceptions: "Not secured to collateral and/or not secured to the home." },
  { company: "Navy Federal Credit Union", aliases: ["Navy Federal", "NFCU"], exceptions: "Verify the client is not currently active military and does not have or need secret / top secret clearance. Cannot be government-endorsed." },
  { company: "OMNI Financial", aliases: ["Omni Financial"], exceptions: "Military personal loans only. Must not be backed by the government." },
  { company: "Together Loans", aliases: ["Together Loans (aka Transform Credit)"], exceptions: "Not issued by a debt settlement company. No loans under $3,000. No monthly memberships.", requiresConfirmation: true },
  { company: "Transform Credit", exceptions: "Not issued by a debt settlement company. No loans under $3,000. No monthly memberships.", requiresConfirmation: true },
  { company: "Velocity Recoveries", exceptions: "Third party debt collector.", distinctFrom: ["Velocity Lending Solution"] },
];

// ─────────────────────────────────────────────────────────────
//  9. PENDING ELP CONFIRMATION
//     Open items sent back to Affiliate Support. Anything listed
//     here is held at its SAFER status until ELP answers in writing.
// ─────────────────────────────────────────────────────────────

export const PENDING_ELP_CONFIRMATION = [
  {
    item: "USAA Federal Savings Bank",
    heldAs: "NOT_LISTED",
    question:
      "USAA Federal Savings Bank was accepted in the 2025 revision but does not appear on the 2026 included list. Confirm whether USAA remains acceptable.",
  },
  {
    item: "Consolidation / Negotiation Loans",
    heldAs: "CONDITIONAL",
    question:
      "ELP guidance (Sept 2026) states consolidation loans are not accepted, but the Acceptable Debts 2026 sheet accepts Consolidation/Negotiation Loans and Transform Credit / Together Loans at $3,000+ when not issued by a debt settlement company. Which governs?",
  },
  {
    item: "Legal fee after year one",
    heldAs: "CONFIRM_BEFORE_QUOTING",
    question:
      "The $675 tier is defined for legal actions received within the first year of enrollment. Confirm the fee when an enrolled debt receives a judgment, lawsuit or summons AFTER the first year.",
  },
  {
    item: "Solar in 3rd party collections",
    heldAs: "CONDITIONAL",
    question:
      "Debt List row 63 reads 'Solar Panels (even if detached) / 3rd party acceptable'. Confirm that solar debt in verified 3rd party collections is enrollable when the originating lender is not on the excluded list. GoodLeap is understood to be excluded in all cases.",
  },
];

// ─────────────────────────────────────────────────────────────
//  10. GLOBAL POLICY RULES (apply to every creditor)
// ─────────────────────────────────────────────────────────────

export const GLOBAL_POLICY_RULES = [
  "Debt must not be part of the original title or lien holder.",
  "Debt must not be attached to the home or dwelling unit.",
  "Authorized-user debts are not enrollable.",
  "Wage garnishments, lawsuits, judgments and summons received BEFORE enrollment are not enrollable.",
  "Business debt is enrollable only when it is in verified 3rd party collections.",
  "If a lender does not appear on either list, the debt TYPE still governs. Escalate to Affiliate Support before enrolling.",
];

// ─────────────────────────────────────────────────────────────
//  11. SUPPORT CONTACTS
// ─────────────────────────────────────────────────────────────

export const SUPPORT_CONTACTS = {
  company: "Legacy Capital Services",
  partner: "Elite Legal Practice (ELP)",
  affiliateSupportTeam: {
    manager: {
      name: "Sara Mitz",
      title: "Affiliate Support Manager",
      mobile: "(725) 347-2897",
      email: "Smitz@legacycapitalservices.com",
      smsEnabled: true,
    },
    staff: [
      { name: "Jaklyn Kraft" },
      { name: "Alma Fernandez Rojas" },
      { name: "Kimberly Fouche" },
    ],
  },
  officePhone: "(725) 218-2796",
  b2bEmail: "b2b@legacycapitalservices.com",
  clientCallerID: "(800) 718-9606",
  // Updated 2026-09-01 — previously Mon–Fri 8:00 AM–4:30 PM PST.
  operationHours: {
    mondayFriday: { open: "7:00 AM", close: "5:00 PM", timezone: "PST" },
    saturday:     { open: "7:00 AM", close: "5:00 PM", timezone: "PST", note: "On Call Only" },
    sunday:       null,
  },
  trainingHours: {
    days: "Monday - Thursday",
    open: "9:00 AM",
    close: "2:30 PM",
    timezone: "PST",
  },
  clientWelcallHours: {
    days: "Monday - Friday",
    open: "7:00 AM",
    close: "5:00 PM",
    timezone: "PST",
  },
};

// ─────────────────────────────────────────────────────────────
//  12. MATCHING CORE
//
//  normalizeName() is the ONLY normalization used for lender names.
//  matchCompany() is exact on the normalized string or on an explicit
//  alias. There is deliberately NO substring fallback: substring
//  matching is what allowed "Willow Lake Lending" to be cleared by a
//  "Lake Lending" rule, and "Velocity Lending Solution" to be cleared
//  by "Velocity Recoveries".
// ─────────────────────────────────────────────────────────────

export function normalizeName(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/&/g, " AND ")
    .replace(/\b(LLC|L\.L\.C|INC|INCORPORATED|CORP|CORPORATION|CO|INC\.)\b/g, " ")
    .replace(/[^A-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function namesFor(entry) {
  return [entry.company, ...(entry.aliases || [])].map(normalizeName).filter(Boolean);
}

/**
 * Exact one-for-one company match. Returns null when the name is not
 * an exact match (or exact alias) of a listed entity.
 */
export function matchCompany(companyName, list) {
  const q = normalizeName(companyName);
  if (!q) return null;
  return list.find((entry) => namesFor(entry).includes(q)) || null;
}

/**
 * Detect an ineligible debt type from free text (debt type OR creditor name).
 * These outrank the lender list entirely — an unlisted tribal lender is
 * still a tribal loan.
 */
export function findGoverningIneligibleType(text) {
  const q = String(text || "").toLowerCase();
  if (!q.trim()) return null;
  return (
    GOVERNING_INELIGIBLE_TYPES.find((t) =>
      t.aliases.some((a) => new RegExp(`(^|[^a-z])${a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z]|$)`, "i").test(q))
    ) || null
  );
}

// ─────────────────────────────────────────────────────────────
//  13. HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────

/**
 * Check if a state is eligible for enrollment.
 */
export function checkStateEligibility(stateCode) {
  const code = String(stateCode || "").toUpperCase().trim();
  if (RESTRICTED_STATES.includes(code)) {
    return {
      eligible: false,
      reason: `ELP cannot accept clients or debts from ${code}. Restricted states: ${RESTRICTED_STATES.join(", ")}.`,
    };
  }
  return { eligible: true, reason: null };
}

/**
 * Check if a client meets program minimums.
 */
export function checkProgramMinimums({ totalDebt, monthlyPayment, accountBalance }) {
  const failures = [];
  if (Number(totalDebt) < PROGRAM_MINIMUMS.minimumDebtLoad)
    failures.push(`Total debt $${totalDebt} is below the $${PROGRAM_MINIMUMS.minimumDebtLoad} minimum.`);
  if (Number(monthlyPayment) < PROGRAM_MINIMUMS.minimumClientPayment)
    failures.push(`Monthly payment $${monthlyPayment} is below the $${PROGRAM_MINIMUMS.minimumClientPayment} minimum.`);
  if (Number(accountBalance) < PROGRAM_MINIMUMS.minimumAccountBalance)
    failures.push(`Account balance $${accountBalance} is below the $${PROGRAM_MINIMUMS.minimumAccountBalance} minimum.`);
  return { eligible: failures.length === 0, failures };
}

/**
 * Look up an acceptable debt type by name or alternate name (exact).
 */
export function getAcceptableDebt(debtType) {
  const q = normalizeName(debtType);
  if (!q) return null;
  return (
    ACCEPTABLE_DEBTS.find(
      (d) => [d.type, ...(d.alternateNames || [])].map(normalizeName).includes(q)
    ) || null
  );
}

/**
 * Check if a debt type is on the unacceptable list.
 * Exact match on the normalized type — NOT a substring scan. The previous
 * implementation used `.includes(query)`, which rejected any debt whose name
 * appeared anywhere in any unacceptable entry (e.g. every "business" debt).
 */
export function isDebtTypeUnacceptable(debtType) {
  const q = normalizeName(debtType);
  if (!q) return false;
  return UNACCEPTABLE_DEBT_TYPES.some((d) => normalizeName(d.type) === q);
}

export function getUnacceptableDebtEntry(debtType) {
  const q = normalizeName(debtType);
  return UNACCEPTABLE_DEBT_TYPES.find((d) => normalizeName(d.type) === q) || null;
}

/**
 * Full debt eligibility check — returns a routing decision.
 * @returns {{status:"ACCEPT"|"CONDITIONAL"|"REJECT"|"UNKNOWN", ...}}
 */
export function checkDebtEligibility(debtType) {
  const base = {
    status: "UNKNOWN",
    reason: null,
    stipulations: null,
    notes: [],
    salesforceActions: [],
    legalFee: null,
    requiresConfirmation: false,
  };

  // 1. Governing ineligible type wins over everything.
  const governing = findGoverningIneligibleType(debtType);
  if (governing) {
    return { ...base, status: "REJECT", reason: governing.reason, governingType: governing.key };
  }

  // 2. Explicit unacceptable list.
  const rejected = getUnacceptableDebtEntry(debtType);
  if (rejected) {
    return {
      ...base,
      status: "REJECT",
      reason: `${rejected.type} is on the ELP unacceptable debt type list.${rejected.note ? " " + rejected.note : ""}`,
    };
  }

  // 3. Acceptable list.
  const match = getAcceptableDebt(debtType);
  if (match) {
    return {
      ...base,
      status: match.conditional ? "CONDITIONAL" : "ACCEPT",
      stipulations: match.stipulations || null,
      notes: match.requiresNote ? [match.noteText] : [],
      salesforceActions: match.requiresSalesforceAction ? [match.salesforceAction] : [],
      legalFee: match.usesLegalFeeSchedule ? LEGAL_FEES : null,
      usesLegalFeeSchedule: !!match.usesLegalFeeSchedule,
      mustBePostEnrollment: !!match.mustBePostEnrollment,
      mustBeInCollections: !!match.mustBeInCollections,
      checkWageAssignment: !!match.checkWageAssignment,
      documentRequired: match.documentRequired || null,
      minimumBalance: match.minimumBalance || null,
      requiresConfirmation: !!match.requiresConfirmation,
      confirmationReason: match.confirmationReason || null,
    };
  }

  return {
    ...base,
    reason: `"${debtType}" was not found on the ELP debt type lists. The lists are not exhaustive — escalate to Affiliate Support before enrolling.`,
  };
}

/**
 * Look up a company/lender — exact match against both lists.
 */
export function lookupCompany(companyName, debtType) {
  const rejected = matchCompany(companyName, COMPANIES_NOT_ACCEPTED);
  if (rejected) {
    return {
      status: "REJECTED",
      entry: rejected,
      message: `${rejected.company} is NOT accepted by ELP. Reason: ${rejected.reason}`,
    };
  }

  const accepted = matchCompany(companyName, COMPANIES_ACCEPTED);
  if (accepted) {
    return {
      status: accepted.requiresConfirmation ? "CONDITIONAL" : "ACCEPTED",
      entry: accepted,
      message: `${accepted.company} is accepted by ELP.${accepted.exceptions ? " Exceptions: " + accepted.exceptions : ""}`,
    };
  }

  // Not on either list — the debt TYPE still governs.
  const governing =
    findGoverningIneligibleType(companyName) || findGoverningIneligibleType(debtType);
  if (governing) {
    return {
      status: "REJECTED",
      entry: null,
      message: `${companyName} is not on ELP's lender lists, but ${governing.reason} ELP's lender list is not exhaustive.`,
      governingType: governing.key,
    };
  }

  return {
    status: "UNKNOWN",
    entry: null,
    message: `${companyName} was not found on the ELP lender lists. The lists are not exhaustive — contact Affiliate Support to confirm before enrolling.`,
  };
}

/**
 * Full enrollment eligibility router.
 * Combines state, minimums, debt type, and company checks into one call.
 *
 * Precedence, highest first:
 *   1. Restricted state
 *   2. Governing ineligible debt type (tribal / home improvement / student)
 *   3. Named excluded lender
 *   4. Explicit unacceptable debt type
 *   5. Program minimums
 *   6. Stipulations, notes, Salesforce actions, confirmations
 */
export function enrollmentEligibilityCheck({
  stateCode,
  totalDebt,
  monthlyPayment,
  accountBalance,
  debtType,
  companyName,
  inThirdPartyCollections,
  legalContext,
}) {
  const result = {
    eligible: true,
    status: "ACCEPT",
    blockers: [],
    warnings: [],
    confirmations: [],
    requiredNotes: [],
    requiredSalesforceActions: [],
    legalFee: null,
    documentRequired: null,
    checkWageAssignment: false,
    mustBeInCollections: false,
  };

  // 1. State
  const stateCheck = checkStateEligibility(stateCode);
  if (!stateCheck.eligible) {
    result.eligible = false;
    result.blockers.push(stateCheck.reason);
  }

  // 2. Program minimums
  const minimumsCheck = checkProgramMinimums({ totalDebt, monthlyPayment, accountBalance });
  if (!minimumsCheck.eligible) {
    result.eligible = false;
    result.blockers.push(...minimumsCheck.failures);
  }

  // 3. Debt type
  const debtCheck = checkDebtEligibility(debtType);
  if (debtCheck.status === "REJECT") {
    result.eligible = false;
    result.blockers.push(debtCheck.reason);
  } else if (debtCheck.status === "UNKNOWN") {
    result.warnings.push(debtCheck.reason);
  } else {
    if (debtCheck.notes.length) result.requiredNotes.push(...debtCheck.notes);
    if (debtCheck.salesforceActions.length) result.requiredSalesforceActions.push(...debtCheck.salesforceActions);
    if (debtCheck.documentRequired) result.documentRequired = debtCheck.documentRequired;
    if (debtCheck.checkWageAssignment) result.checkWageAssignment = true;
    if (debtCheck.requiresConfirmation) result.confirmations.push(debtCheck.confirmationReason);

    // 3a. 3rd-party-collections gate — business debt, autos, MCAs, timeshares.
    if (debtCheck.mustBeInCollections) {
      result.mustBeInCollections = true;
      if (inThirdPartyCollections === false) {
        result.eligible = false;
        result.blockers.push(
          `${debtType} is only enrollable when it is in verified 3rd party collections.`
        );
      } else if (inThirdPartyCollections === undefined) {
        result.warnings.push(
          `${debtType} must be in verified 3rd party collections. Confirm with the client before enrolling.`
        );
      }
    }

    // 3b. Legal fee schedule — judgments, lawsuits, summons.
    if (debtCheck.usesLegalFeeSchedule) {
      const fee = getLegalFee(legalContext || {});
      if (fee.status === "REJECT") {
        result.eligible = false;
        result.blockers.push(fee.reason);
      } else {
        result.legalFee = { amount: fee.fee, spreadMonths: fee.spreadMonths, basis: fee.reason };
        if (fee.needsConfirmation) result.confirmations.push(fee.reason);
      }
    }
  }

  // 4. Company
  if (companyName) {
    const companyCheck = lookupCompany(companyName, debtType);
    if (companyCheck.status === "REJECTED") {
      result.eligible = false;
      result.blockers.push(companyCheck.message);
    } else if (companyCheck.status === "UNKNOWN") {
      result.warnings.push(companyCheck.message);
    } else {
      if (companyCheck.status === "CONDITIONAL") result.confirmations.push(companyCheck.message);
      else if (companyCheck.entry?.exceptions)
        result.warnings.push(`Note for ${companyCheck.entry.company}: ${companyCheck.entry.exceptions}`);
    }
  }

  result.status = !result.eligible
    ? "REJECT"
    : result.confirmations.length || result.warnings.length
    ? "CONDITIONAL"
    : "ACCEPT";

  return result;
}

// ─────────────────────────────────────────────────────────────
//  14. ROUTER-READY DEFAULT EXPORT
// ─────────────────────────────────────────────────────────────

export default {
  // Metadata
  KB_REVISION,
  // Data
  PROGRAM_MINIMUMS,
  RESTRICTED_STATES,
  LEGAL_FEES,
  GOVERNING_INELIGIBLE_TYPES,
  CONSOLIDATION_RULE,
  ACCEPTABLE_DEBTS,
  UNACCEPTABLE_DEBT_TYPES,
  COMPANIES_NOT_ACCEPTED,
  COMPANIES_ACCEPTED,
  PENDING_ELP_CONFIRMATION,
  GLOBAL_POLICY_RULES,
  SUPPORT_CONTACTS,
  // Functions
  normalizeName,
  matchCompany,
  findGoverningIneligibleType,
  checkStateEligibility,
  checkProgramMinimums,
  getAcceptableDebt,
  isDebtTypeUnacceptable,
  getUnacceptableDebtEntry,
  checkDebtEligibility,
  lookupCompany,
  getLegalFee,
  enrollmentEligibilityCheck,
};

// ─────────────────────────────────────────────────────────────
//  USAGE EXAMPLES
// ─────────────────────────────────────────────────────────────
//
//  import kb from "./knowledgebase.js";
//
//  kb.lookupCompany("Willow Lake Lending");
//  // → REJECTED — Tribal Lender. (Does NOT match the "Lake Lending" accept rule.)
//
//  kb.lookupCompany("Lake Lending");
//  // → ACCEPTED — Unsecured debt only.
//
//  kb.lookupCompany("GoodLeap");
//  // → REJECTED — Solar / Clean Energy Finance. No 3rd party exception.
//
//  kb.lookupCompany("Some Unlisted Tribal Lender", "Tribal Loan");
//  // → REJECTED — debt type governs even though the lender is unlisted.
//
//  kb.getLegalFee({ clientEnrolled: true, debtEnrolled: false });
//  // → { status: "FEE", fee: 850, spreadMonths: 2 }
//
//  kb.getLegalFee({ receivedPreEnrollment: true });
//  // → { status: "REJECT", ... }
//
//  kb.enrollmentEligibilityCheck({
//    stateCode: "CA", totalDebt: 9500, monthlyPayment: 300, accountBalance: 200,
//    debtType: "Business Debts", companyName: null, inThirdPartyCollections: false,
//  });
//  // → { eligible: false, blockers: ["Business Debts is only enrollable when..."] }
