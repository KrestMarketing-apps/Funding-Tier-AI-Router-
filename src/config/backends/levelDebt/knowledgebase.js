export const knowledgebase = {
  summary:
    "Level Debt is a debt settlement backend for qualified consumers with at least $7,000 in enrolled debt. It is not debt validation. Some states use an attorney model and some states are blacked out entirely.",

  serviceType: "Debt Settlement",

  minimums: {
    totalDebt: 7000,
    perAccount: 200,
    draftPayments: [
      {
        label: "Debt enrolled $7,000 – $9,999",
        debtMin: 7000,
        debtMax: 9999,
        minMonthlyPayment: 150
      },
      {
        label: "Debt enrolled $10,000 – $12,999",
        debtMin: 10000,
        debtMax: 12999,
        minMonthlyPayment: 200
      },
      {
        label: "Debt enrolled $13,000+",
        debtMin: 13000,
        debtMax: null,
        minMonthlyPayment: 250
      }
    ]
  },

  stateRules: {
    blackoutStates: ["AK", "RI", "VT", "WV", "OR", "GU", "HI", "ME", "MT", "PR", "SC", "SD", "UT", "WI"],
    attorneyModelStates: ["CT", "GA", "LA", "MN", "NV", "NH", "NJ", "ND", "OH", "PA", "TN", "WA", "WY"]
  },

  acceptedDebtTypes: [
    "Unsecured debt",
    "Unsecured Personal Loan",
    "Unsecured Line of Credit",
    "Medical Bill",
    "Payday Loan",
    "Tribal Loan",
    "Cell Phone Bill",
    "Repossession Deficiency",
    "Auto Repo Deficiency",
    "Back Rent",
    "Apartment Back Rent (Collections)",
    "Business Debt",
    "Judgment",
    "Private Student Loan"
  ],

  rejectedDebtTypes: [
    "Federal Student Loan",
    "Navient Student Loan",
    "SBA Loan",
    "Timeshare",
    "IRS Tax Debt",
    "Alimony / Child Support",
    "Casino Debt",
    "Cash Call",
    "Overdraft Account",
    "Employer Debt",
    "Mortgage",
    "Auto Loan (Secured)",
    "Cross Collateralized Account",
    "Furniture Store Financing",
    "Credit Union Loan",
    "Direct Furniture Store Loan",
    "Military Account",
    "AFES Account",
    "Secured Loan",
    "Installment Sales Contract"
  ],

  conditionalRules: [
    "Discover debt cannot exceed 60% of total enrolled debt.",
    "Private student loans cannot exceed 25% of total enrolled debt.",
    "Medical, back rent, and repo-related debt combined cannot exceed 50% of enrolled debt.",
    "California residents cannot enroll private student loans.",
    "Discover private student loans are not accepted.",
    "Business debt requires the business to be closed or unprofitable.",
    "Litigation accounts require legal review.",
    "Lendmark secured accounts are not accepted, unsecured is okay.",
    "Mariner Finance secured accounts are not accepted, unsecured is okay.",
    "OneMain secured accounts are not accepted, unsecured is okay.",
    "Regional Finance secured accounts are not accepted, unsecured is okay.",
    "Republic Finance secured accounts are not accepted, unsecured is okay.",
    "Goldman Sachs credit cards are not accepted, but Apple Cards and Goldman Sachs loans are accepted."
  ],

  unacceptableCreditors: [
    "ALLEVIATE TAX LLC",
    "Acceptance Now",
    "ACIMA",
    "Advance Financial",
    "AGCO FINANCE",
    "ALL State Employee Credit Union variants",
    "Aqua Finance",
    "Bell Finance",
    "BHG Financial",
    "BHG Money",
    "All BHG entities",
    "Bobs Discount Furniture",
    "Bobs Finance",
    "Bobs Furniture",
    "Concord Servicing",
    "Cornerstone Financial",
    "CreditCentral",
    "Credologi LLC",
    "DR Bank",
    "EMPOWER FCU",
    "Enerbank",
    "ESL Credit Union",
    "Farmers Furniture",
    "FRMRS FURN",
    "FCRP Capital LLC",
    "Fort Worth Credit Union",
    "Forth Worth CU",
    "Fortera Credit Union",
    "Garden Federal Credit Union",
    "Golden One Credit Union",
    "Goldman Sachs credit cards only",
    "GoodLeap",
    "Hawaii CU",
    "HC ROYA",
    "HYCITE",
    "Royal Prestige",
    "Heights Financial",
    "Island Finance",
    "ISPC",
    "Kabbage Loans",
    "KIKOFF",
    "Koalafi",
    "LHPCC Trust I",
    "Loan Pal",
    "Local Government Federal Credit Union",
    "Matco Tools Financing",
    "Matco Fin",
    "Military Star",
    "Nebraska Furniture",
    "Omni Loans",
    "Opensky",
    "PINNACLE FINANCIAL GROUP",
    "Pioneer Loans",
    "Popular Bank",
    "Banco Popular",
    "PowerPay",
    "Preferred Loans",
    "Quick Help Loans",
    "Red River Credit",
    "REDRIVERCR",
    "REDSTONE Credit Union",
    "RENT-A-CENTER",
    "RFFC FINANCIAL",
    "Robinhood",
    "Security Finance",
    "STATE EMPLOYEES C U",
    "Service Finance Company",
    "SVCFIN",
    "SRVFINCO",
    "Snap On Credit",
    "SOLAR MOSAIC",
    "Southern Finance",
    "Sunset Financial",
    "Toledo Finance",
    "Tower Loans",
    "West Creek Financial",
    "WSECU",
    "Yendo"
  ],

  conditionalCreditors: [
    {
      creditor: "Lendmark",
      rule: "No secured accounts. Unsecured is okay."
    },
    {
      creditor: "Mariner Finance",
      rule: "No secured accounts. Unsecured is okay."
    },
    {
      creditor: "OneMain",
      rule: "No secured accounts. Unsecured is okay."
    },
    {
      creditor: "Regional Finance",
      rule: "No secured accounts. Unsecured is okay."
    },
    {
      creditor: "Republic Finance",
      rule: "No secured accounts. Unsecured is okay."
    },
    {
      creditor: "Goldman Sachs",
      rule: "Credit cards are not accepted. Apple Cards and GS loans are accepted."
    }
  ],

  creditorRules: [
    "ALLEVIATE TAX LLC is not accepted.",
    "Acceptance Now is not accepted.",
    "ACIMA is not accepted.",
    "Advance Financial is not accepted.",
    "AGCO FINANCE is not accepted.",
    "All State Employee Credit Union variants are not accepted.",
    "Aqua Finance is not accepted.",
    "Bell Finance is not accepted.",
    "All BHG entities are not accepted.",
    "Concord Servicing is not accepted.",
    "Cornerstone Financial is not accepted.",
    "CreditCentral is not accepted.",
    "Credologi LLC is not accepted.",
    "DR Bank is not accepted.",
    "EMPOWER FCU is not accepted.",
    "Enerbank is not accepted.",
    "ESL Credit Union is not accepted.",
    "Farmers Furniture / FRMRS FURN is not accepted.",
    "FCRP Capital LLC is not accepted.",
    "Fort Worth Credit Union / Forth Worth CU is not accepted.",
    "Fortera Credit Union is not accepted.",
    "Garden Federal Credit Union is not accepted.",
    "Golden One Credit Union is not accepted.",
    "GoodLeap is not accepted.",
    "Hawaii CU is not accepted.",
    "HC ROYA / HYCITE / Royal Prestige is not accepted.",
    "Heights Financial is not accepted.",
    "Island Finance (PR) is not accepted.",
    "ISPC is not accepted.",
    "Kabbage Loans is not accepted.",
    "KIKOFF is not accepted.",
    "Koalafi is not accepted.",
    "LHPCC Trust I is not accepted.",
    "Loan Pal is not accepted.",
    "Local Government Federal Credit Union is not accepted.",
    "Matco Tools Financing / Matco Fin is not accepted.",
    "Military Star is not accepted.",
    "Nebraska Furniture is not accepted.",
    "Omni Loans is not accepted.",
    "Opensky is not accepted.",
    "PINNACLE FINANCIAL GROUP is not accepted.",
    "Pioneer Loans is not accepted.",
    "Popular Bank / Banco Popular (PR) is not accepted.",
    "PowerPay is not accepted.",
    "Preferred Loans is not accepted.",
    "Quick Help Loans is not accepted.",
    "Red River Credit / REDRIVERCR is not accepted.",
    "REDSTONE Credit Union is not accepted.",
    "RENT-A-CENTER is not accepted.",
    "RFFC FINANCIAL is not accepted.",
    "Robinhood is not accepted.",
    "Security Finance is not accepted.",
    "STATE EMPLOYEES C U is not accepted.",
    "Service Finance Company / SVCFIN / SRVFINCO is not accepted.",
    "Snap On Credit is not accepted.",
    "SOLAR MOSAIC is not accepted.",
    "Southern Finance is not accepted.",
    "Sunset Financial is not accepted.",
    "Toledo Finance is not accepted.",
    "Tower Loans is not accepted.",
    "West Creek Financial is not accepted.",
    "WSECU is not accepted.",
    "Yendo is not accepted.",
    "Lendmark: unsecured okay, secured not accepted.",
    "Mariner Finance: unsecured okay, secured not accepted.",
    "OneMain: unsecured okay, secured not accepted.",
    "Regional Finance: unsecured okay, secured not accepted.",
    "Republic Finance: unsecured okay, secured not accepted.",
    "Goldman Sachs credit cards are not accepted, but Apple Cards and Goldman Sachs loans are accepted."
  ],

  positioning: {
    bestFor: [
      "Prospects who want debt settlement",
      "Prospects who want affordability-focused monthly structure",
      "Prospects with $7,000+ in qualifying unsecured debt"
    ],
    notFor: [
      "Prospects specifically wanting debt validation",
      "Prospects under $7,000 total debt",
      "Prospects with excluded debt types, excluded creditors, or blackout states"
    ]
  },

  compliance: {
    requiredDisclosures: [
      "Debt settlement is not debt validation.",
      "Results vary by creditor and by file.",
      "Debt settlement may negatively impact credit.",
      "Not all debts or creditors qualify."
    ],
    prohibitedClaims: [
      "Guaranteed savings",
      "Guaranteed approval",
      "We will eliminate your debt",
      "Your credit will improve"
    ]
  }
};
