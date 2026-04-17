import { legacyBackend } from "@/config/backends/legacy";

export const backendEngine = {
  evaluateLead(lead) {
    const disqualifier = legacyBackend.routing.getDisqualifier(lead, legacyBackend);

    if (disqualifier) {
      return {
        qualified: false,
        disqualifier,
        score: 0,
        scoreLabel: "LOW_FIT",
        route: "ROUTE_OTHER_BACKEND_OR_DISQUALIFY"
      };
    }

    const score = legacyBackend.scoring.score(lead, legacyBackend);

    return {
      qualified: true,
      disqualifier: null,
      score,
      scoreLabel: legacyBackend.scoring.label(score),
      route: legacyBackend.scoring.route(score)
    };
  },

  getOpeningScript() {
    return legacyBackend.compliance.openingTemplate;
  },

  getRequiredDisclosures() {
    return legacyBackend.compliance.requiredDisclosures;
  },

  getObjectionHandler(key) {
    return legacyBackend.objections.get(key);
  },

  checkComplianceText(text) {
    return legacyBackend.compliance.checkText(text);
  }
};
