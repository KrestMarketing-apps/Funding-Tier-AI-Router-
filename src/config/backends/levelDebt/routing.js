export const routing = {
  blackoutStates: ["AK", "RI", "VT", "WV", "OR", "GU", "HI", "ME", "MT", "PR", "SC", "SD", "UT", "WI"],
  attorneyModelStates: ["CT", "GA", "LA", "MN", "NV", "NH", "NJ", "ND", "OH", "PA", "TN", "WA", "WY"],

  normalizeState(state) {
    return String(state || "").trim().toUpperCase();
  },

  isAllowedState(state) {
    return !this.blackoutStates.includes(this.normalizeState(state));
  },

  isAttorneyModelState(state) {
    return this.attorneyModelStates.includes(this.normalizeState(state));
  },

  hasHardStopFlags(lead) {
    const flags = lead?.levelFlags || [];

    return flags.some((f) => {
      const v = String(f || "");
      return (
        v.includes("not accepted") ||
        v.includes("requires at least") ||
        v.includes("60%") ||
        v.includes("50%") ||
        v.includes("25%") ||
        v.includes("CA residents") ||
        v.includes("Discover private")
      );
    });
  },

  shouldRoute(lead, backend) {
    return (
      this.isAllowedState(lead?.state) &&
      backend.qualification.isQualified(lead) &&
      !this.hasHardStopFlags(lead)
    );
  },

  getDisqualifier(lead, backend) {
    if (!this.isAllowedState(lead?.state)) return "STATE_BLOCKED";

    const failures = backend.qualification.getFailures(lead);
    if (failures.length > 0) return failures[0];

    if (this.hasHardStopFlags(lead)) return "LEVEL_HARD_STOP";

    return null;
  }
};
