const LEGACY_SUPPORT = {
  id: "legacy",
  name: "Legacy",
  serviceType: "Debt Resolution",

  modelType: {
    greenStates: "Review Required",
    redStates: "Review Required"
  },

  timezone: "America/Los_Angeles",

  serviceability: {
    excludedStates: [],
    notes: [
      "Legacy serviceability must be confirmed.",
      "State handling should be reviewed before routing.",
      "Do not assume all states are serviceable without confirmation."
    ]
  },

  operatingHours: {
    monday: { open: "08:00", close: "17:00", closed: false },
    tuesday: { open: "08:00", close: "17:00", closed: false },
    wednesday: { open: "08:00", close: "17:00", closed: false },
    thursday: { open: "08:00", close: "17:00", closed: false },
    friday: { open: "08:00", close: "17:00", closed: false },
    saturday: { open: null, close: null, closed: true },
    sunday: { open: null, close: null, closed: true }
  },

  qcSupport: {
    qcCallRequired: true,

    qcWindow: {
      monday: { open: "08:00", close: "17:00", closed: false },
      tuesday: { open: "08:00", close: "17:00", closed: false },
      wednesday: { open: "08:00", close: "17:00", closed: false },
      thursday: { open: "08:00", close: "17:00", closed: false },
      friday: { open: "08:00", close: "17:00", closed: false },
      saturday: { open: null, close: null, closed: true },
      sunday: { open: null, close: null, closed: true }
    },

    sameDayQCCutoff: {
      monday: "15:30",
      tuesday: "15:30",
      wednesday: "15:30",
      thursday: "15:30",
      friday: "15:30",
      saturday: null,
      sunday: null
    },

    nextDayRecoveryRules: [
      "If submitted after cutoff, save the file and work it next business day.",
      "Do not promise same-day QC after cutoff.",
      "Confirm consumer callback availability for the next business day.",
      "Use submit_and_prep when file can be stored but live contact is weak."
    ],

    maxDelayBeforeRiskHours: 24,
    highFalloutRiskHours: 48
  },

  pushWindows: {
    best: [
      {
        start: "09:00",
        end: "14:30",
        note: "Best working assumption until Legacy confirms true support window."
      }
    ],

    avoid: [
      {
        start: "15:30",
        end: "17:00",
        note: "Late-day push window is weaker for same-day QC."
      }
    ]
  },

  contactMethods: {
    primary: "Portal Submission",
    secondary: "Phone Support",
    tertiary: "Email Escalation"
  },

  escalationPath: [
    "Assigned support rep",
    "Internal account manager",
    "Backend escalation contact"
  ],

  submissionMethod: {
    primary: "Portal Submission",
    backup: "Manual Support Submission"
  },

  documentation: {
    required: [
      "Consumer full contact information",
      "Debt breakdown",
      "Basic creditor information"
    ],
    optional: [
      "Statements for missing accounts",
      "Proof of income if requested",
      "Additional notes for special handling"
    ]
  },

  consumerReadiness: {
    requiredBeforePush: [
      "Consumer phone must be on",
      "Consumer should be available for the next 1 to 3 hours",
      "Consumer should expect follow-up contact",
      "Consumer should not be unavailable due to work or other obligations"
    ]
  },

  dealKillers: [
    "Unconfirmed serviceability",
    "Active bankruptcy",
    "Already enrolled in another program",
    "Missing required debt details",
    "State restrictions not yet confirmed"
  ],

  preferredDeals: [
    "Files needing manual review",
    "Fallback routing scenarios",
    "Debt profiles acceptable under Legacy guidelines once confirmed"
  ],

  fallbackRouting: {
    ifNotEligible: "manual_review",
    ifAfterHours: "submit_and_prep",
    ifPoorFit: "manual_review"
  },

  routerNotes: [
    "Legacy rules are not fully confirmed yet.",
    "Use caution before hard-routing files automatically.",
    "Files can still be submitted or saved after hours, but QC timing may be weak.",
    "Best used with manual review until backend rules are finalized."
  ],

  agentGuidance: {
    pushNow: "This file can be pushed now if the backend is available and the consumer is ready.",
    submitAndPrep: "We can still submit and save the file now, but QC timing may be delayed, so set expectations correctly.",
    holdAndSchedule: "This should be held and scheduled for a stronger contact window or manual backend review."
  }
};

export default LEGACY_SUPPORT;
