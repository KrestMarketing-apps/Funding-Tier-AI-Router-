const LEVEL_DEBT_SUPPORT = {
  id: "level_debt",
  name: "Level Debt",
  serviceType: "Debt Resolution",

  modelType: {
    greenStates: "Non-Attorney",
    redStates: "Attorney"
  },

  timezone: "America/Los_Angeles",

  serviceability: {
    excludedStates: ["AK", "RI", "VT"],
    notes: [
      "Green states use non-attorney model.",
      "Red states require attorney model.",
      "Do not route excluded states to Level Debt."
    ]
  },

  operatingHours: {
    monday: { open: "06:00", close: "18:30", closed: false },
    tuesday: { open: "06:00", close: "18:30", closed: false },
    wednesday: { open: "06:00", close: "18:30", closed: false },
    thursday: { open: "06:00", close: "18:30", closed: false },
    friday: { open: "06:00", close: "18:30", closed: false },
    saturday: { open: "08:00", close: "16:30", closed: false },
    sunday: { open: null, close: null, closed: true }
  },

  qcSupport: {
    qcCallRequired: true,

    qcWindow: {
      monday: { open: "06:00", close: "18:30", closed: false },
      tuesday: { open: "06:00", close: "18:30", closed: false },
      wednesday: { open: "06:00", close: "18:30", closed: false },
      thursday: { open: "06:00", close: "18:30", closed: false },
      friday: { open: "06:00", close: "18:30", closed: false },
      saturday: { open: "08:00", close: "16:30", closed: false },
      sunday: { open: null, close: null, closed: true }
    },

    sameDayQCCutoff: {
      monday: "16:30",
      tuesday: "16:30",
      wednesday: "16:30",
      thursday: "16:30",
      friday: "16:30",
      saturday: "14:00",
      sunday: null
    },

    nextDayRecoveryRules: [
      "If file is submitted after cutoff, save the file and tag for next-business-day follow-up.",
      "Do not promise same-day QC after cutoff time.",
      "Confirm consumer availability for next-day callback or QC.",
      "If consumer is likely to go cold, use submit_and_prep logic and set expectations clearly."
    ],

    maxDelayBeforeRiskHours: 24,
    highFalloutRiskHours: 48
  },

  pushWindows: {
    best: [
      {
        start: "08:30",
        end: "15:30",
        note: "Best window for live contact, backend responsiveness, and QC alignment."
      }
    ],

    avoid: [
      {
        start: "17:30",
        end: "18:30",
        note: "Late-day push window is weaker for same-day QC completion."
      },
      {
        start: "14:00",
        end: "16:30",
        days: ["saturday"],
        note: "Late Saturday push window is weaker."
      }
    ]
  },

  contactMethods: {
    primary: "Warm Transfer",
    secondary: "Portal Submission",
    tertiary: "Internal Email Escalation"
  },

  escalationPath: [
    "Transfer team",
    "Internal account manager",
    "Backend support contact"
  ],

  submissionMethod: {
    primary: "Warm Transfer",
    backup: "Portal Submission"
  },

  documentation: {
    required: [
      "Consumer full contact information",
      "Debt breakdown",
      "Soft-pull data or credit report information"
    ],
    optional: [
      "Statements for missing unsecured accounts",
      "Proof of income for edge cases",
      "Additional creditor detail if balances are incomplete"
    ]
  },

  consumerReadiness: {
    requiredBeforePush: [
      "Consumer phone must be on",
      "Consumer must be available for the next 1 to 3 hours",
      "Consumer should expect a QC or backend follow-up call",
      "Consumer should not be actively working or unavailable",
      "Consumer should disable spam blocking if possible"
    ]
  },

  dealKillers: [
    "Active bankruptcy",
    "Already enrolled in a debt relief program",
    "Medical debt exceeds 50 percent of total enrolled debt",
    "Back rent exceeds 50 percent of total enrolled debt",
    "Private student loans exceed 25 percent of total enrolled debt",
    "Bad creditor mix requiring alternate routing",
    "Unserviceable state"
  ],

  preferredDeals: [
    "15K to 80K unsecured debt",
    "Credit cards",
    "Personal loans",
    "Employed consumers",
    "Strong unsecured creditor mix"
  ],

  fallbackRouting: {
    ifNotEligible: "consumer_shield",
    ifAfterHours: "submit_and_prep",
    ifPoorFit: "consumer_shield"
  },

  routerNotes: [
    "Prioritize Level Debt for stronger debt profiles over 10K.",
    "Flag heavy Discover concentration.",
    "Flag private student loan weighting over internal threshold.",
    "Files can still be submitted after hours, but same-day QC may fail.",
    "Use submit_and_prep when file can be saved now but live close conditions are weak."
  ],

  agentGuidance: {
    pushNow: "This looks like a strong fit and we are within a good window to push now.",
    submitAndPrep: "We can still submit and save the file now, but QC timing may be delayed, so set expectations correctly.",
    holdAndSchedule: "This should be held and scheduled for a stronger contact window so the consumer gets proper follow-up."
  }
};

export default LEVEL_DEBT_SUPPORT;
