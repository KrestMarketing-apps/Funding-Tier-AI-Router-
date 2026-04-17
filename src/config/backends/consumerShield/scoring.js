export const scoring = {
  score(lead, backend) {
    let score = 0;
    const debt = Number(lead?.totalDebt || 0);

    if (debt >= backend.qualification.minDebt) score += 20;
    if (debt >= 4000 && debt <= 5999) score += 20;
    if (backend.routing.isAllowedState(lead?.state)) score += 15;
    if (lead?.wantsFixedPayment === true) score += 20;
    if (lead?.wantsDebtValidation === true) score += 15;
    if (lead?.prefersSimpleProgram === true) score += 10;

    if (lead?.wantsSettlement === true) score -= 15;
    if (lead?.wantsAttorneyLed === true) score -= 10;

    return Math.max(0, Math.min(100, score));
  },

  label(score) {
    if (score >= 85) return "HIGH_FIT";
    if (score >= 70) return "TRANSFER_READY";
    if (score >= 50) return "REVIEW_REQUIRED";
    return "LOW_FIT";
  },

  route(score) {
    if (score >= 85) return "TRANSFER_TO_CONSUMER_SHIELD";
    if (score >= 70) return "SEND_TO_CLOSER";
    if (score >= 50) return "MANUAL_REVIEW";
    return "DISQUALIFY";
  }
};
