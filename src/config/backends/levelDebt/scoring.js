export const scoring = {
  score(lead, backend) {
    let score = 0;

    if (Number(lead?.totalDebt || 0) >= backend.qualification.minDebt) score += 20;
    if (backend.routing.isAllowedState(lead?.state)) score += 15;
    if (!backend.routing.hasHardStopFlags(lead)) score += 20;
    if (lead?.wantsSettlement === true) score += 20;
    if (lead?.wantsLowerPayment === true) score += 15;
    if (lead?.hasHardship === true) score += 10;

    if (lead?.wantsDebtValidation === true) score -= 20;
    if (lead?.wantsFixedPayment === true) score -= 10;
    if (lead?.wantsAttorneyLed === true) score -= 5;

    return Math.max(0, Math.min(100, score));
  },

  label(score) {
    if (score >= 85) return "HIGH_FIT";
    if (score >= 70) return "TRANSFER_READY";
    if (score >= 50) return "REVIEW_REQUIRED";
    return "LOW_FIT";
  },

  route(score) {
    if (score >= 85) return "TRANSFER_TO_LEVEL_DEBT";
    if (score >= 70) return "SEND_TO_CLOSER";
    if (score >= 50) return "MANUAL_REVIEW";
    return "DISQUALIFY";
  }
};
