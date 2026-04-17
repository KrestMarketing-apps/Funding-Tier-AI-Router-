export const routing = {
  blockedStates: ["NC", "PA", "CO", "WA", "CT", "NJ", "OR", "TX"],

  normalizeState(state) {
    return String(state || "").trim().toUpperCase();
  },

  isAllowedState(state) {
    return !this.blockedStates.includes(this.normalizeState(state));
  },

  shouldRoute(lead, backend) {
    const debt = Number(lead?.totalDebt || 0);

    return (
      this.isAllowedState(lead?.state) &&
      backend.qualification.isQualified(lead) &&
      debt >= 4000
    );
  },

  getDisqualifier(lead, backend) {
    if (!this.isAllowedState(lead?.state)) return "STATE_BLOCKED";

    const failures = backend.qualification.getFailures(lead);
    if (failures.length > 0) return failures[0];

    return null;
  }
};
