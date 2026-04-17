export const scoring = {
  score(lead, backend) {
    let score = 0;

    if (Number(lead?.totalDebt || 0) > backend.qualification.minDebt) score += 20;
    if (Number(lead?.monthlyPayment || 0) > backend.qualification.minMonthlyPayment) score += 15;
    if (lead?.hasHardship === true) score += 10;
    if (lead?.openToLegalProgram === true) score += 10;
    if (lead?.bankVerified === true) score += 10;
    if (backend.routing.isAllowedState(lead?.state)) score += 10;

    if (lead?.wantsGuarantee === true) score -= 15;
    if (lead?.thinksLoan === true) score -= 10;
    if (lead?.objectsToCreditImpact === true) score -= 15;
    if (lead?.objectsToLawsuitDisclosure === true) score -= 15;
    if (lead?.bankVerified !== true) score -= 20;

    return Math.max(0, Math.min(100, score));
  },

  label(score) {
    if (score >= 85) return "HIGH_FIT";
    if (score >= 70) return "TRANSFER_READY";
    if (score >= 50) return "REVIEW_REQUIRED";
    return "LOW_FIT";
  },

  route(score) {
    if (score >= 85) return "TRANSFER_TO_LEGACY";
    if (score >= 70) return "SEND_TO_CLOSER";
    if (score >= 50) return "MANUAL_REVIEW";
    return "DISQUALIFY";
  }
};
