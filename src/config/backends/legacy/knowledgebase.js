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
 *    - Payout models, software fees and chargeback terms (Exhibit D)
 *
 *  Last updated: September 23, 2026
 * ============================================================
 */

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
//  3. ACCEPTABLE DEBT TYPES
// ─────────────────────────────────────────────────────────────

export const ACCEPTABLE_DEBTS = [
  {
    type: "3rd Party Collections",
    stipulations: "See unacceptable debt list. Must not be tribal, business, or otherwise excluded.",
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Alarm System",
    alternateNames: ["ADT Alarm System"],
    stipulations: "Removal of the system may be required based on its age.",
    requiresNote: true,
    noteText: "Client is aware the system may be removed.",
    requiresSalesforceAction: false,
  },
  {
    type: "Auto Loans",
    alternateNames: ["RV Loans", "Motorcycle Loans", "Leases", "Repos", "Repo Balances"],
    stipulations: "MUST BE IN 3RD PARTY COLLECTIONS. Cannot accept deficiency loans.",
    mustBeInCollections: true,
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Back Rent",
    stipulations: "Client must no longer be living in the unit.",
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Cash Advance",
    stipulations: null,
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Check Cashing",
    stipulations: null,
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Consolidation Loans",
    stipulations: "Not issued by a debt settlement company. No Transform Credit loans under $3,000. No monthly memberships.",
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
    type: "Credit Unions / Federal",
    stipulations: "Add Cross Collateral / Repo Note in Salesforce.",
    requiresNote: false,
    requiresSalesforceAction: true,
    salesforceAction: "Add Cross Collateral / Repo Note",
  },
  {
    type: "Department Stores",
    stipulations: "Add Repo Note / Case in Salesforce.",
    requiresNote: false,
    requiresSalesforceAction: true,
    salesforceAction: "Add Repo Note / Case",
  },
  {
    type: "Furniture Loans",
    alternateNames: ["Jewelry Loans", "Furniture and/or Jewelry"],
    stipulations: "Unsecured only. Add Repo Note in Salesforce.",
    requiresNote: false,
    requiresSalesforceAction: true,
    salesforceAction: "Add Repo Note",
  },
  {
    type: "Gas Cards",
    stipulations: null,
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Gyms / Fitness Centers",
    alternateNames: ["Health Clubs"],
    stipulations: "If disputed, note that client will lose membership.",
    requiresNote: true,
    noteText: "Client understands they will lose membership.",
    requiresSalesforceAction: false,
  },
  {
    type: "Installment Loans",
    alternateNames: ["Note Loans"],
    stipulations: "Not issued by a debt settlement company. Add Cross Collateral / Repo Note in Salesforce.",
    requiresNote: false,
    requiresSalesforceAction: true,
    salesforceAction: "Add Cross Collateral / Repo Note",
  },
  {
    type: "Judgements",
    stipulations: "Debt must already be enrolled. Judgement must come AFTER enrollment. $650 legal representation fee — must be paid prior to representation — can be spread over 2 months.",
    legalFee: 650,
    legalFeeSpreadMonths: 2,
    mustBePostEnrollment: true,
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Lawsuits",
    stipulations: "Debt must already be enrolled. Lawsuit must come AFTER enrollment. $650 legal representation fee — must be paid prior to representation — can be spread over 2 months.",
    legalFee: 650,
    legalFeeSpreadMonths: 2,
    mustBePostEnrollment: true,
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Lending Club",
    stipulations: "Not secured to collateral and/or not secured to home.",
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Lines of Credit",
    alternateNames: ["Lines of Unsecured Credit"],
    stipulations: "Must be used like a credit card. Must include the first page of the statement showing both client and billing information.",
    documentRequired: "First page of statement with client and billing info",
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Medical Debt",
    stipulations: "Must NOT be currently receiving treatment. Must provide the first page of the statement showing both client and billing details.",
    documentRequired: "First page of statement with client and billing info",
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Merchant Cash Advance Loans",
    stipulations: "MUST BE IN 3RD PARTY COLLECTIONS.",
    mustBeInCollections: true,
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Military Credit Unions",
    stipulations: "Excludes: Military Star, Pioneer Loans, BX Omni, and VA Loans.",
    excludedLenders: ["Military Star", "Pioneer Loans", "BX Omni", "VA Loans"],
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Military Loans",
    stipulations: "Verify client is NOT currently active military. Verify client does NOT have or will need secret or top secret clearance. Cannot be endorsed by the government.",
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Navy Federal Credit Union",
    stipulations: "Verify not currently active military. No secret or top secret clearance. Cannot be government-endorsed.",
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "OMNI Financial",
    stipulations: "Military personal loans only. Must NOT be backed by the government.",
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Online Buy Now - Pay Later",
    alternateNames: ["Affirm", "Afterpay", "Klarna", "Online Payback Programs"],
    stipulations: "Clear screenshot of balance required. Must check for Wage Assignment before enrolling.",
    checkWageAssignment: true,
    documentRequired: "Clear screenshot of current balance",
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Payday Loans",
    stipulations: "Check for Wage Assignment before enrolling.",
    checkWageAssignment: true,
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Personal Loans",
    alternateNames: ["Personal Credit Cards", "Signature Loans"],
    stipulations: "Not secured to collateral and/or not secured to home.",
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Summons",
    stipulations: "$650 legal representation fee applies for enrolling after signing up. Can be spread over 2 months.",
    legalFee: 650,
    legalFeeSpreadMonths: 2,
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Timeshares",
    stipulations: "MUST BE IN 3RD PARTY COLLECTIONS.",
    mustBeInCollections: true,
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Transform Credit",
    alternateNames: ["Together Loans"],
    stipulations: "Not issued by a debt settlement company. No Transform Credit loans under $3,000. No monthly memberships.",
    minimumBalance: 3000,
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Unsecured Credit Cards",
    stipulations: "See unacceptable list for excluded lenders.",
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Unsecured Debts",
    stipulations: "See unacceptable list. Add Cross Collateral / Repo Note in Salesforce. Client must be notified service may be shut off.",
    requiresNote: true,
    noteText: "Client is aware that service will be shut off.",
    requiresSalesforceAction: true,
    salesforceAction: "Add Cross Collateral / Repo Note",
  },
  {
    type: "USAA Federal Savings Bank",
    stipulations: null,
    requiresNote: false,
    requiresSalesforceAction: false,
  },
  {
    type: "Utility Bills",
    alternateNames: ["Power", "Internet", "Electric", "Cellular", "Cable"],
    stipulations: "Must be with a PREVIOUS address/provider only. Client must NOT currently be using the service. Note required confirming client is aware service will be shut off.",
    mustBePreviousProvider: true,
    requiresNote: true,
    noteText: "Client is aware that service will be shut off.",
    requiresSalesforceAction: false,
  },
  {
    type: "Velocity",
    stipulations: "Acceptable as 3rd party collections only.",
    mustBeInCollections: true,
    requiresNote: false,
    requiresSalesforceAction: false,
  },
];

// ─────────────────────────────────────────────────────────────
//  4. UNACCEPTABLE DEBT TYPES
// ─────────────────────────────────────────────────────────────

export const UNACCEPTABLE_DEBT_TYPES = [
  "Air Conditioning Units",
  "Alimony",
  "Child Support",
  "Bankruptcy",
  "Business Credit Cards under EIN#",
  "Business Credit Cards under SS#",
  "Business Debts",
  "Business Inventory Outstanding Balances",
  "Business Loans under EIN#",
  "Business Loans under SS#",
  "City Debts",
  "County Debts",
  "State Debts",
  "Federal Debts",
  "Citations",
  "Tickets",
  "Credit Builder Monthly Memberships",
  "Debt Negotiation Loans",
  "Debt Consolidation Loans (from debt settlement companies)",
  "Home Equity Line of Credit (HELOC)",
  "Home Improvement Loans (Roofs, Kitchens, Windows)",
  "Mechanic's Liens Filed Against Property",
  "Mortgages",
  "Home Loans",
  "Pioneer Loans",
  "Solar Panels",
  "Spot Loans",
  "Student Loans",
  "Tax Debts",
  "Tribal Loans",
  "VA Loans",
  "Wage Garnishments (Court Ordered)",
];

// ─────────────────────────────────────────────────────────────
//  5. COMPANIES NOT ACCEPTED
// ─────────────────────────────────────────────────────────────

export const COMPANIES_NOT_ACCEPTED = [
  { company: "All Companies (Default)",           debtType: "Wage Garnishments / Lawsuits / Summons (Pre-Enrollment)" },
  { company: "All Companies (Default)",           debtType: "Business Loans (must be 3rd party collections to accept)" },
  { company: "All Companies (Default)",           debtType: "Authorized User Debts" },
  { company: "American Recovery Systems",         debtType: "Collateral Recovery" },
  { company: "Aqua Finance",                      debtType: "Lending / Financing company" },
  { company: "Arrowhead Advance",                 debtType: "Tribal" },
  { company: "Big Picture Loans",                 debtType: "Tribal" },
  { company: "Birch Lending",                     debtType: "Tribal" },
  { company: "Bison Cash",                        debtType: "Tribal" },
  { company: "Blue Mountain Loan",                debtType: "Tribal" },
  { company: "Bonneville Collection",             debtType: "Standard collection agency / Debt recovery firm" },
  { company: "Boost Credit",                      debtType: "Tribal" },
  { company: "Bright Lending",                    debtType: "Tribal" },
  { company: "BX Omni",                           debtType: "Military-affiliated" },
  { company: "Clear Air Lending",                 debtType: "Tribal" },
  { company: "Climb Loans",                       debtType: "Student Loans" },
  { company: "Crane Lending",                     debtType: "Tribal" },
  { company: "Credit 9",                          debtType: "Consumer credit / lending" },
  { company: "Credit Cube",                       debtType: "Tribal" },
  { company: "E Loan Warehouse",                  debtType: "Tribal" },
  { company: "Eagle Wing Funds",                  debtType: "Investment / lending fund" },
  { company: "Elective Group USA",                debtType: "Federal student loan provider" },
  { company: "Eloan Warehouse",                   debtType: "Tribal" },
  { company: "Equity Sales Finance",              debtType: "Asset finance / sales financing" },
  { company: "Express Cash Flow",                 debtType: "Must be 3rd party — not collateral, business, or commercial" },
  { company: "Figure Tech",                       alternateNames: ["Figure Lending"], debtType: "Home Equity / Secured" },
  { company: "Fineday Funds",                     debtType: "Tribal" },
  { company: "GoodLeap LLC",                      alternateNames: ["Goodleap Solar"], debtType: "Fintech / Clean energy / Solar" },
  { company: "Green Arrow Loans",                 debtType: "Tribal" },
  { company: "Greenline",                         debtType: "Tribal" },
  { company: "GreenSky",                          debtType: "Per Legal — not accepted" },
  { company: "Hollis Cobb",                       debtType: "Collection / finance" },
  { company: "Home Equity Line of Credit",        debtType: "Secured / Home equity" },
  { company: "Kadikorn Bank",                     debtType: "Bank / financial institution" },
  { company: "Lendumo",                           debtType: "Tribal" },
  { company: "Level Up Funding",                  debtType: "Tribal" },
  { company: "LightStream",                       debtType: "Home improvement, auto, debt consolidation, recreation, adoption, education" },
  { company: "Little Lake Lending",               debtType: "Tribal" },
  { company: "Loan At Last",                      debtType: "Tribal" },
  { company: "Lookout Credit Union",              debtType: "Credit union" },
  { company: "Makwa Finance",                     debtType: "Tribal" },
  { company: "Makwa Lending",                     debtType: "Tribal" },
  { company: "Mariner Finance",                   alternateNames: ["Personal Finance Company"], debtType: "Installment Loans" },
  { company: "Maxlend",                           debtType: "Tribal" },
  { company: "Merit Financial Trust",             debtType: "Tribal" },
  { company: "Military Star",                     debtType: "Government-backed loans" },
  { company: "Minto Money",                       debtType: "Tribal" },
  { company: "MobiLoans LLC",                     debtType: "Tribal" },
  { company: "My QuickWallet",                    alternateNames: ["MyQuickWallet"], debtType: "Tribal" },
  { company: "NCR Finance",                       debtType: "Finance company / lender" },
  { company: "Night Wings Lending",               debtType: "Tribal" },
  { company: "Opici Funds LLC",                   debtType: "Tribal" },
  { company: "Post Lake Lending",                 debtType: "Tribal" },
  { company: "Premier Loan Solutions",            debtType: "Tribal" },
  { company: "Reach Financial",                   debtType: "Personal / small-dollar / consumer finance" },
  { company: "Rise Up Lending",                   debtType: "Tribal" },
  { company: "River Valley Loans",                debtType: "Tribal" },
  { company: "Sallie Mae Loans",                  debtType: "Education / student lending" },
  { company: "Same Day Credit",                   debtType: "Tribal" },
  { company: "SBA Loans",                         debtType: "Government-backed small business loans" },
  { company: "Simple Fast Loans",                 debtType: "Payday / quick consumer lending" },
  { company: "Snap On Credit",                    debtType: "Secured loans only" },
  { company: "Spotloan",                          debtType: "Tribal" },
  { company: "Sunbelt Federal Credit Union",      alternateNames: ["Sunbelt FCU"], debtType: "Credit union" },
  { company: "Three Sticks Lending",              debtType: "Tribal" },
  { company: "Today Cash",                        debtType: "Tribal" },
  { company: "Tule Lake Lending",                 debtType: "Tribal" },
  { company: "Uprova",                            debtType: "Tribal" },
  { company: "Versara Lending",                   debtType: "Consolidation / Negotiation" },
  { company: "White Pine Lending",                debtType: "Tribal" },
  { company: "Willow Lake Lending",               debtType: "Tribal" },
  { company: "WithU Loans",                       debtType: "Tribal" },
  { company: "Write St. Education Liens",         debtType: "Educational lender / student finance" },
  { company: "Yendo",                             debtType: "Auto-secured / vehicle title" },
  { company: "ZipLoan",                           alternateNames: ["Zuntafi"], debtType: "Student / consumer loan origination & servicing" },
  { company: "Zuntafi",                           alternateNames: ["ZipLoan"], debtType: "Student / consumer loan origination & servicing" },
];

// ─────────────────────────────────────────────────────────────
//  6. COMPANIES ACCEPTED
// ─────────────────────────────────────────────────────────────

export const COMPANIES_ACCEPTED = [
  { company: "3rd Party Collections",             exceptions: "See unacceptable debt list." },
  { company: "ADT Alarm System",                  exceptions: "Removal may be required based on age. Note required." },
  { company: "All Companies (Default)",           exceptions: "Must not be part of original title/lien holder. Must not be attached to home/dwelling unit." },
  { company: "Auto Loans / RVs / Motos / Repos",  exceptions: "MUST BE IN 3RD PARTY COLLECTIONS. Cannot accept deficiency loans." },
  { company: "Back Rent",                         exceptions: "Client must no longer be living in the unit." },
  { company: "Business Debts / Loans",            exceptions: "MUST BE IN 3RD PARTY COLLECTIONS." },
  { company: "Cash Advance",                      exceptions: null },
  { company: "Check Cashing",                     exceptions: null },
  { company: "Consolidation Loans",               exceptions: "Not issued by a debt settlement company. No Transform Credit under $3,000. No monthly memberships." },
  { company: "Credit Builder Loans",              exceptions: "Add Repo Note in Salesforce." },
  { company: "Credit Unions / Federal",           exceptions: "Add Repo Note in Salesforce." },
  { company: "Department Stores",                 exceptions: "Add Repo Note in Salesforce." },
  { company: "Furniture and/or Jewelry",          exceptions: "Add Repo Note in Salesforce. Unsecured only." },
  { company: "Gas Cards",                         exceptions: null },
  { company: "Gyms / Fitness Centers",            exceptions: "Note required — client understands they will lose membership." },
  { company: "Health Clubs",                      exceptions: "Note required — client understands they will lose membership." },
  { company: "Installment Loans / Note Loans",    exceptions: "Not issued by debt settlement company. Add Cross Collateral / Repo Note in Salesforce." },
  { company: "Judgements",                        exceptions: "$650 legal representation fee. Can be spread over 2 months." },
  { company: "Lake Lending",                      exceptions: "Not tied to collateral." },
  { company: "Lawsuits",                          exceptions: "$650 legal representation fee. Can be spread over 2 months." },
  { company: "Lending Club",                      exceptions: "Not secured to collateral and/or not secured to home." },
  { company: "Lines of Credit",                   exceptions: "Must be used like a credit card. First page of statement required." },
  { company: "Medical Debt",                      exceptions: "First page of statement required. Must not be currently receiving treatment." },
  { company: "Merchant Cash Advance Loans",       exceptions: "MUST BE IN 3RD PARTY COLLECTIONS." },
  { company: "Military Credit Unions",            exceptions: "Excludes: Military Star, Pioneer Loans, BX Omni, VA Loans." },
  { company: "Military Loans",                    exceptions: "Not endorsed by the government." },
  { company: "Navy Federal Credit Union",         exceptions: "Verify not active military. No secret/top secret clearance. Not government-endorsed." },
  { company: "OMNI Financial",                    exceptions: "Military personal loans only. Not backed by the government." },
  { company: "Online Buy Now - Pay Later",        exceptions: "Clear screenshot required. Check for Wage Assignment. (Affirm, Afterpay, Klarna, etc.)" },
  { company: "Payday Loans",                      exceptions: "Check for Wage Assignment." },
  { company: "Personal Loans",                    exceptions: "Not secured to collateral and/or not secured to home." },
  { company: "Signature Loans",                   exceptions: "Not secured to collateral and/or not secured to home." },
  { company: "Summons",                           exceptions: "$650 legal representation fee. Can be spread over 2 months." },
  { company: "Timeshares",                        exceptions: "MUST BE IN 3RD PARTY COLLECTIONS." },
  { company: "Together Loans",                    alternateNames: ["Transform Credit"], exceptions: "Not issued by debt settlement company. No loans under $3,000. No monthly memberships." },
  { company: "Transform Credit",                  exceptions: "Not issued by debt settlement company. No loans under $3,000. No monthly memberships." },
  { company: "Unsecured Credit Cards",            exceptions: null },
  { company: "Unsecured Debts",                   exceptions: null },
  { company: "USAA Federal Savings Bank",         exceptions: null },
  { company: "Utility Bills",                     exceptions: "Previous provider/address only. Note required — client aware service will be shut off." },
  { company: "Velocity",                          exceptions: "Acceptable as 3rd party collections only." },
];

// ─────────────────────────────────────────────────────────────
//  7. SUPPORT CONTACTS
// ─────────────────────────────────────────────────────────────

export const SUPPORT_CONTACTS = {
  company: "Legacy Capital Services",
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
  operationHours: {
    mondayFriday: { open: "8:00 AM", close: "4:30 PM", timezone: "PST" },
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
//  7b. PAYOUT MODELS, SOFTWARE FEES & CHARGEBACKS
//      Source: LCS Exhibit D — Payout Model Election
//      (doc 20260601EXD6065), signed by Nathan Pottish 9/23/2026.
//      Funding Tier elected ALL THREE: Residual, Accelerated, Defender.
// ─────────────────────────────────────────────────────────────

/**
 * Every payout is calculated on the SERVICE FEE BASE: the lead's cleared
 * payment, less the monthly maintenance fee, less returns / refunds /
 * chargebacks, less processing, drafting and software fees — then multiplied by
 * the model's rate. Litigation awards, bankruptcy and other attorney services
 * are excluded. Active Leads at termination keep paying out on this schedule.
 */
export const SERVICE_FEE_BASE = {
  deductions: [
    "Monthly maintenance fee",
    "Returns, refunds and claw backs (chargebacks)",
    "Payment processing, drafting ($4 per draft) and software fees",
  ],
  excludes: ["Litigation awards and fees", "Bankruptcy and other additional attorney services"],
  sourceOfPayment: "Paid by LCS from any source; owed once the lead pays, whether or not LCS is paid by the law firm.",
};

export const PAYOUT_MODELS = {
  residual: {
    name: "Residual Model (Option 1 — New Billable Payout)",
    maxMonths: 48, // Service Fee is calculated on the first 48 months of MMP (or the term, if shorter)
    tiers: [
      { tier: 1, filesPerMonth: "1-99", rate: 0.60 },
      { tier: 2, filesPerMonth: "100+", rate: 0.65 },
    ],
    // Months 1-2: the equivalent of up to two maintenance fees is paid back
    // ("Additional Compensation"), so the payment passes through less only the
    // draft fee. From month 3 the maintenance fee also comes off.
    additionalCompensation: "First 2 months: maintenance fees paid back (up to two maintenance fees).",
    tier2Rules:
      "100+ qualified enrollments in a month (accepted, not cancelled, becoming Active Leads by month end) earns Tier 2 on enrollments from the FOLLOWING month. Falls back to Tier 1 after 3 consecutive months under 100. The rate in effect in the enrollment month holds for the life of the lead.",
    discrepancy:
      "Exhibit D's Tier 1 paragraph says 55% while its tier table says 60%. Tools use 60%; confirm with LCS.",
  },
  accelerated: {
    name: "Accelerated Model (Option 2 — hybrid payout)",
    frontRate: 0.90,   // 90% of the lead's payment...
    frontMonths: 7,    // ...for months 1-7
    backRate: 0.25,    // 25%...
    backMonths: 17,    // ...for months 8-24
    maxMonths: 24,     // nothing is paid after month 24
    minTerm: 24,       // leads written under 24 months are paid on the Residual model only
    base:
      "Tools default to the Service Fee base (payment less maintenance and fees). Option 2 itself says 'the Active Lead's payment' — confirm with LCS whether maintenance comes off first; it decides whether Accelerated beats Residual.",
    whenItHelps:
      "Front-loads cash into months 1-7 and stops at 24. It trades away months 25-48 of residual income, so it pays best on files likely to cancel early.",
  },
  defender: {
    name: "Defender Model",
    eliteDefenderRate: 0.50, // Limited Legal Representation Plan: 50% of the monthly fee per Active Lead
    myDefenderPlan: "My Defender Plan (My Defender Plan LLC): 50% of the set-up fee + 50% of the monthly fee per Active Lead.",
  },
  electedModels: ["residual", "accelerated", "defender"],
  expectedActiveLeads:
    "LCS expects 100 Active Leads per month starting 120 days after execution — not a strict requirement, but weighed in performance reviews.",
};

/** Software fees LCS deducts from Service Fees. 30 days' notice to change (sooner if the software vendor changes). */
export const SOFTWARE_FEES = {
  eSign: 0,           // per application generated
  creditPull: 2.60,   // per credit pull through LCS and/or its software
  seatFeesPerUserPerMonth: [
    { files: "over 50 in the month", fee: 25 },
    { files: "1 to 49 in the month", fee: 50 },
    { files: "0 in the month", fee: 100 },
  ],
  seatFeeGap: "Exhibit D does not price exactly 50 files; tools charge $50 until LCS confirms.",
};

/** An "Active Lead" has paid its Monthly Maintenance Fee AND its Legal Service Fee that month. */
export const ACTIVE_LEAD_RULES = {
  notActive: [
    "Cancelled, paused or rejected",
    "Completed Legal Service Fee payments",
    "Moved to litigation-only or other services (e.g. bankruptcy)",
    "Missed that month's Legal Service Fee payment",
  ],
  chargebackPeriod:
    "Two fully cleared MMPs (4+ payments on a split schedule). If a client fails to make or clear 2 full MMPs, everything paid on that lead is charged back against any future payment.",
  confidentiality:
    "After enrollment, any client who contacts Funding Tier is directed back to the law firm — no involvement or discussion of the client.",
  mmp: "Minimum Monthly Payment per the client's agreement with the law firm; the law firm may change it.",
};

/**
 * Funding Tier's monthly payout on one lead for a given deal month.
 * @param {{ serviceFeeMonthly:number, maintenanceFee:number, draftFees:number, term:number, model:'residual'|'accelerated', tierRate?:number, base?:'net'|'draft' }} p
 * @param {number} month - 1-based deal month
 */
export function payoutForMonth(p, month) {
  const { serviceFeeMonthly, maintenanceFee, term } = p;
  if (month < 1 || month > term) return 0;
  const net = serviceFeeMonthly;                       // payment − maintenance − draft fees
  const withMaint = serviceFeeMonthly + maintenanceFee; // payment − draft fees
  const residual = () => {
    if (month > PAYOUT_MODELS.residual.maxMonths) return 0;
    return month <= 2 ? withMaint : net * (p.tierRate ?? PAYOUT_MODELS.residual.tiers[0].rate);
  };
  if (p.model !== "accelerated" || term < PAYOUT_MODELS.accelerated.minTerm) return residual();
  const A = PAYOUT_MODELS.accelerated;
  const base = p.base === "draft" ? withMaint : net;
  if (month <= A.frontMonths) return base * A.frontRate;
  if (month <= A.frontMonths + A.backMonths) return base * A.backRate;
  return 0;
}

// ─────────────────────────────────────────────────────────────
//  8. HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────

/**
 * Check if a state is eligible for enrollment.
 * @param {string} stateCode - Two-letter state code
 * @returns {{ eligible: boolean, reason: string|null }}
 */
export function checkStateEligibility(stateCode) {
  const code = stateCode?.toUpperCase();
  if (RESTRICTED_STATES.includes(code)) {
    return {
      eligible: false,
      reason: `We cannot accept clients or debts from ${code}. Restricted states: ${RESTRICTED_STATES.join(", ")}.`,
    };
  }
  return { eligible: true, reason: null };
}

/**
 * Check if a client meets program minimums.
 * @param {object} params
 * @param {number} params.totalDebt
 * @param {number} params.monthlyPayment
 * @param {number} params.accountBalance
 * @returns {{ eligible: boolean, failures: string[] }}
 */
export function checkProgramMinimums({ totalDebt, monthlyPayment, accountBalance }) {
  const failures = [];
  if (totalDebt < PROGRAM_MINIMUMS.minimumDebtLoad)
    failures.push(`Total debt $${totalDebt} is below the $${PROGRAM_MINIMUMS.minimumDebtLoad} minimum.`);
  if (monthlyPayment < PROGRAM_MINIMUMS.minimumClientPayment)
    failures.push(`Monthly payment $${monthlyPayment} is below the $${PROGRAM_MINIMUMS.minimumClientPayment} minimum.`);
  if (accountBalance < PROGRAM_MINIMUMS.minimumAccountBalance)
    failures.push(`Account balance $${accountBalance} is below the $${PROGRAM_MINIMUMS.minimumAccountBalance} minimum.`);
  return { eligible: failures.length === 0, failures };
}

/**
 * Look up an acceptable debt type by name or alternate name.
 * @param {string} debtType
 * @returns {object|null}
 */
export function getAcceptableDebt(debtType) {
  const query = debtType?.toLowerCase().trim();
  return (
    ACCEPTABLE_DEBTS.find(
      (d) =>
        d.type.toLowerCase() === query ||
        (d.alternateNames || []).some((a) => a.toLowerCase() === query)
    ) || null
  );
}

/**
 * Check if a debt type is on the unacceptable list.
 * @param {string} debtType
 * @returns {boolean}
 */
export function isDebtTypeUnacceptable(debtType) {
  const query = debtType?.toLowerCase().trim();
  return UNACCEPTABLE_DEBT_TYPES.some((d) => d.toLowerCase().includes(query));
}

/**
 * Full debt eligibility check — returns a routing decision.
 * @param {string} debtType
 * @returns {object}
 */
export function checkDebtEligibility(debtType) {
  if (isDebtTypeUnacceptable(debtType)) {
    return {
      status: "REJECT",
      reason: `${debtType} is on the unacceptable debt type list.`,
      stipulations: null,
      notes: [],
      salesforceActions: [],
      legalFee: null,
    };
  }
  const match = getAcceptableDebt(debtType);
  if (match) {
    return {
      status: "ACCEPT",
      reason: null,
      stipulations: match.stipulations || null,
      notes: match.requiresNote ? [match.noteText] : [],
      salesforceActions: match.requiresSalesforceAction ? [match.salesforceAction] : [],
      legalFee: match.legalFee || null,
      mustBeInCollections: match.mustBeInCollections || false,
      checkWageAssignment: match.checkWageAssignment || false,
      documentRequired: match.documentRequired || null,
    };
  }
  return {
    status: "UNKNOWN",
    reason: `${debtType} was not found in any list. Escalate to Affiliate Support.`,
    stipulations: null,
    notes: [],
    salesforceActions: [],
    legalFee: null,
  };
}

/**
 * Look up a company/lender — checks both accepted and rejected lists.
 * @param {string} companyName
 * @returns {{ status: "ACCEPTED"|"REJECTED"|"UNKNOWN", entry: object|null, message: string }}
 */
export function lookupCompany(companyName) {
  const query = companyName?.toLowerCase().trim();

  const rejected = COMPANIES_NOT_ACCEPTED.find(
    (c) =>
      c.company.toLowerCase() === query ||
      (c.alternateNames || []).some((a) => a.toLowerCase() === query)
  );
  if (rejected) {
    return {
      status: "REJECTED",
      entry: rejected,
      message: `${rejected.company} is NOT accepted. Reason: ${rejected.debtType}.`,
    };
  }

  const accepted = COMPANIES_ACCEPTED.find(
    (c) =>
      c.company.toLowerCase() === query ||
      (c.alternateNames || []).some((a) => a.toLowerCase() === query)
  );
  if (accepted) {
    return {
      status: "ACCEPTED",
      entry: accepted,
      message: `${accepted.company} is accepted.${accepted.exceptions ? " Exceptions: " + accepted.exceptions : ""}`,
    };
  }

  return {
    status: "UNKNOWN",
    entry: null,
    message: `${companyName} was not found in the lender lists. Escalate to Affiliate Support for verification.`,
  };
}

/**
 * Full enrollment eligibility router.
 * Combines state, minimums, debt type, and company checks into one call.
 * @param {object} params
 * @param {string} params.stateCode
 * @param {number} params.totalDebt
 * @param {number} params.monthlyPayment
 * @param {number} params.accountBalance
 * @param {string} params.debtType
 * @param {string} [params.companyName]
 * @returns {object}
 */
export function enrollmentEligibilityCheck({
  stateCode,
  totalDebt,
  monthlyPayment,
  accountBalance,
  debtType,
  companyName,
}) {
  const result = {
    eligible: true,
    blockers: [],
    warnings: [],
    requiredNotes: [],
    requiredSalesforceActions: [],
    legalFee: null,
    documentRequired: null,
    checkWageAssignment: false,
    mustBeInCollections: false,
  };

  // 1. State check
  const stateCheck = checkStateEligibility(stateCode);
  if (!stateCheck.eligible) {
    result.eligible = false;
    result.blockers.push(stateCheck.reason);
  }

  // 2. Program minimums check
  const minimumsCheck = checkProgramMinimums({ totalDebt, monthlyPayment, accountBalance });
  if (!minimumsCheck.eligible) {
    result.eligible = false;
    result.blockers.push(...minimumsCheck.failures);
  }

  // 3. Debt type check
  const debtCheck = checkDebtEligibility(debtType);
  if (debtCheck.status === "REJECT") {
    result.eligible = false;
    result.blockers.push(debtCheck.reason);
  } else if (debtCheck.status === "UNKNOWN") {
    result.warnings.push(debtCheck.reason);
  } else {
    if (debtCheck.notes.length)             result.requiredNotes.push(...debtCheck.notes);
    if (debtCheck.salesforceActions.length) result.requiredSalesforceActions.push(...debtCheck.salesforceActions);
    if (debtCheck.legalFee)                 result.legalFee = debtCheck.legalFee;
    if (debtCheck.documentRequired)         result.documentRequired = debtCheck.documentRequired;
    if (debtCheck.checkWageAssignment)      result.checkWageAssignment = true;
    if (debtCheck.mustBeInCollections)      result.mustBeInCollections = true;
  }

  // 4. Company check (optional)
  if (companyName) {
    const companyCheck = lookupCompany(companyName);
    if (companyCheck.status === "REJECTED") {
      result.eligible = false;
      result.blockers.push(companyCheck.message);
    } else if (companyCheck.status === "UNKNOWN") {
      result.warnings.push(companyCheck.message);
    } else if (companyCheck.entry?.exceptions) {
      result.warnings.push(`Note for ${companyName}: ${companyCheck.entry.exceptions}`);
    }
  }

  return result;
}

// ─────────────────────────────────────────────────────────────
//  9. ROUTER-READY DEFAULT EXPORT
// ─────────────────────────────────────────────────────────────

export default {
  // Data
  PROGRAM_MINIMUMS,
  RESTRICTED_STATES,
  ACCEPTABLE_DEBTS,
  UNACCEPTABLE_DEBT_TYPES,
  COMPANIES_NOT_ACCEPTED,
  COMPANIES_ACCEPTED,
  SUPPORT_CONTACTS,
  SERVICE_FEE_BASE,
  PAYOUT_MODELS,
  SOFTWARE_FEES,
  ACTIVE_LEAD_RULES,
  // Functions
  payoutForMonth,
  checkStateEligibility,
  checkProgramMinimums,
  getAcceptableDebt,
  isDebtTypeUnacceptable,
  checkDebtEligibility,
  lookupCompany,
  enrollmentEligibilityCheck,
};

// ─────────────────────────────────────────────────────────────
//  USAGE EXAMPLES
// ─────────────────────────────────────────────────────────────
//
//  import kb from "./knowledgebase.js";
//
//  // Check if a state is eligible
//  kb.checkStateEligibility("GA");
//  // → { eligible: false, reason: "We cannot accept clients or debts from GA..." }
//
//  // Check program minimums
//  kb.checkProgramMinimums({ totalDebt: 8000, monthlyPayment: 300, accountBalance: 150 });
//  // → { eligible: true, failures: [] }
//
//  // Look up a debt type
//  kb.checkDebtEligibility("Medical Debt");
//  // → { status: "ACCEPT", stipulations: "Must not be currently receiving treatment...", documentRequired: "First page of statement..." }
//
//  // Look up a lender
//  kb.lookupCompany("Mariner Finance");
//  // → { status: "REJECTED", message: "Mariner Finance is NOT accepted. Reason: Installment Loans." }
//
//  // Full enrollment eligibility check
//  kb.enrollmentEligibilityCheck({
//    stateCode:      "CA",
//    totalDebt:      9500,
//    monthlyPayment: 300,
//    accountBalance: 200,
//    debtType:       "Payday Loans",
//    companyName:    "Speedy Cash",
//  });
//  // → { eligible: true, blockers: [], warnings: [], checkWageAssignment: true, ... }
