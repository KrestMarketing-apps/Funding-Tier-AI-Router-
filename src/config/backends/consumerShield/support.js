const CONSUMER_SHIELD_SUPPORT = {
  id: "consumer_shield",
  name: "Consumer Shield",
  serviceType: "Debt Resolution",

  modelType: {
    greenStates: "Standard",
    redStates: "Review Required"
  },

  timezone: "America/New_York",

  serviceability: {
    excludedStates: ["NC", "PA", "CO", "WA", "CT", "NJ", "OR", "TX"],
    notes: [
      "Consumer Shield is serviceable in all other U.S. states outside the excluded list.",
      "Good fallback backend for lower-balance deals and overflow scenarios.",
      "Files can still be submitted after hours, but same-day QC may not happen."
    ]
  },

  operatingHours: {
    monday: { open: "09:00", close: "19:00", closed: false },
    tuesday: { open: "09:00", close: "19:00", closed: false },
    wednesday: { open: "09:00", close: "19:00", closed: false },
    thursday: { open: "09:00", close: "19:00", closed: false },
    friday: { open: "09:00", close: "19:00", closed: false },
    saturday: { open: "10:00", close: "14:00", closed: false },
    sunday: { open: null, close: null, closed: true }
  },

  qcSupport: {
    qcCallRequired: true,

    qcWindow: {
      monday: { open: "09:00", close: "19:00", closed: false },
      tuesday: { open: "09:00", close: "19:00", closed: false },
      wednesday: { open: "09:00", close: "19:00", closed: false },
      thursday: { open: "09:00", close: "19:00", closed: false },
      friday: { open: "09:00", close: "19:00", closed: false },
      saturday: { open: "10:00", close: "14:00", closed: false },
      sunday: { open: null, close: null, closed: true }
    },

    sameDayQCCutoff: {
      monday: "18:00",
      tuesday: "18:00",
      wednesday: "18:00",
      thursday: "18:00",
      friday: "18:00",
      saturday: "13:00",
      sunday: null
    },

    nextDayRecoveryRules: [
      "If submitted after cutoff, save the file and work it next day.",
      "Consumer Shield is more forgiving than Level Debt on delayed QC timing.",
      "Do not promise immediate same-day QC after cutoff.",
      "Set expectation that follow-up may come later."
    ],

    maxDelayBeforeRiskHours: 48,
    highFalloutRiskHours: 72
  },

  pushWindows: {
    best: [
      {
        start: "10:00",
        end: "17:00",
        note: "Best general window for same-day follow-up and QC alignment."
      }
    ],

    avoid: [
      {
        start: "18:00",
        end: "19:00",
        note: "Late-day push window is weaker for same-day QC."
      },
      {
        start: "13:00",
        end: "14:00",
        days: ["saturday"],
        note: "Late Saturday push window is weaker."
      }
    ]
  },

  contactMethods: {
    primary: "Portal Submission",
    secondary: "Scheduled Follow-Up",
    tertiary: "Email / Affiliate Manager Escalation"
  },

  escalationPath: [
    "Internal affiliate manager",
    "Backend support team"
  ],

  submissionMethod: {
    primary: "Portal Submission",
    backup: "Manual Support Escalation"
  },

  documentation: {
    required: [
      "Consumer full contact information",
      "Debt estimate",
      "Basic creditor overview"
    ],
    optional: [
      "Statements",
      "Supporting account details",
      "Additional unsecured account verification"
    ]
  },

  consumerReadiness: {
    requiredBeforePush: [
      "Consumer should know a follow-up may come later",
      "Consumer should be reachable within the next 24 hours",
      "Consumer should watch for calls, texts, and email"
    ]
  },

  dealKillers: [
    "Debt under 4K",
    "Excluded state",
    "Active bankruptcy if disallowed by backend review",
    "Missing minimum file information"
  ],

  preferredDeals: [
    "4K to 15K debt",
    "Mixed or weaker creditor profiles",
    "Lower-quality leads",
    "After-hours overflow from stronger backends"
  ],

  fallbackRouting: {
    ifNotEligible: "manual_review",
    ifAfterHours: "submit_and_prep",
    ifPoorFit: "manual_review"
  },

  routerNotes: [
    "Use Consumer Shield for lower balance deals and overflow scenarios.",
    "Files can still be submitted after hours, but immediate QC may not happen.",
    "Consumer Shield is generally more forgiving on delayed follow-up than Level Debt.",
    "Still avoid overpromising same-day contact after cutoff."
  ],

  agentGuidance: {
    pushNow: "This can be submitted now and is within a good follow-up window.",
    submitAndPrep: "We can still submit and save the file now, but let the consumer know follow-up may not be immediate.",
    holdAndSchedule: "This should be held and scheduled for a stronger contact window if same-day movement is important."
  }
};

export default CONSUMER_SHIELD_SUPPORT;
