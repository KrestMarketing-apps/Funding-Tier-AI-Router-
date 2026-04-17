export const routing = {
  blockedStates: ["ID", "ND", "GA"],

  normalizeState(state) {
    return String(state || "").trim().toUpperCase();
  },

  isAllowedState(state) {
    return !this.blockedStates.includes(this.normalizeState(state));
  },

  shouldRoute(lead, backend) {
    return (
      this.isAllowedState(lead?.state) &&
      backend.qualification.isQualified(lead) &&
      lead?.openToLegalProgram === true
    );
  },

  getDisqualifier(lead, backend) {
    if (!this.isAllowedState(lead?.state)) return "STATE_BLOCKED";

    const failures = backend.qualification.getFailures(lead);
    if (failures.length > 0) return failures[0];

    if (lead?.openToLegalProgram !== true) return "NOT_OPEN_TO_LEGAL_PROGRAM";

    return null;
  }
};
