import { legacyBackend } from "@/config/backends/legacy";
import { consumerShieldBackend } from "@/config/backends/consumerShield";
import { levelDebtBackend } from "@/config/backends/levelDebt";

function getPreference(lead) {
  return String(lead?.preference || "best_fit").toLowerCase();
}

function getTermMonths(lead, totalDebt) {
  const requested = Number(lead?.termMonths || 0);

  if (requested > 0) return requested;

  // sensible defaults
  if (totalDebt <= 6000) return 24;
  if (totalDebt <= 15000) return 36;
  return 48;
}

function evaluateLegacy(lead) {
  const totalDebt = Number(lead?.totalDebt || 0);
  const termMonths = getTermMonths(lead, totalDebt);

  const qualifies = legacyBackend.routing.shouldRoute(
    {
      ...lead,
      monthlyPayment: legacyBackend.revenue.getMonthlyPayment(totalDebt, termMonths)
    },
    legacyBackend
  );

  if (!qualifies) {
    return {
      id: "legacy_capital_services",
      name: "Legacy Capital Services",
      qualified: false,
      score: 0,
      route: "DISQUALIFY",
      revenue: 0
    };
  }

  const revenueResult = legacyBackend.revenue.calculate({
    totalDebt,
    termMonths,
    payoutModel: lead?.legacyPayoutModel || "billable",
    monthlyFiles: lead?.monthlyFiles || 1
  });

  const score = legacyBackend.scoring.score(
    {
      ...lead,
      monthlyPayment: revenueResult.monthlyPayment
    },
    legacyBackend
  );

  return {
    id: "legacy_capital_services",
    name: "Legacy Capital Services",
    qualified: true,
    score,
    scoreLabel: legacyBackend.scoring.label(score),
    route: legacyBackend.scoring.route(score),
    revenue: revenueResult?.totalRevenue || 0,
    revenueDetail: revenueResult,
    termMonths
  };
}

function evaluateConsumerShield(lead) {
  const totalDebt = Number(lead?.totalDebt || 0);

  const qualifies = consumerShieldBackend.routing.shouldRoute(
    {
      ...lead,
      stateEligible: consumerShieldBackend.routing.isAllowedState(lead?.state)
    },
    consumerShieldBackend
  );

  if (!qualifies) {
    return {
      id: "consumer_shield",
      name: "Consumer Shield",
      qualified: false,
      score: 0,
      route: "DISQUALIFY",
      revenue: 0
    };
  }

  const score = consumerShieldBackend.scoring.score(lead, consumerShieldBackend);

  const revenueResult = consumerShieldBackend.revenue?.getProjectedRevenue
    ? consumerShieldBackend.revenue.getProjectedRevenue(totalDebt)
    : null;

  return {
    id: "consumer_shield",
    name: "Consumer Shield",
    qualified: true,
    score,
    scoreLabel: consumerShieldBackend.scoring.label(score),
    route: consumerShieldBackend.scoring.route(score),
    revenue: revenueResult?.totalProjectedRevenue || 0,
    revenueDetail: revenueResult
  };
}

function evaluateLevelDebt(lead) {
  const totalDebt = Number(lead?.totalDebt || 0);
  const termMonths = getTermMonths(lead, totalDebt);

  const qualifies = levelDebtBackend.routing.shouldRoute(lead, levelDebtBackend);

  if (!qualifies) {
    return {
      id: "level_debt",
      name: "Level Debt",
      qualified: false,
      score: 0,
      route: "DISQUALIFY",
      revenue: 0
    };
  }

  const score = levelDebtBackend.scoring.score(lead, levelDebtBackend);

  const revenueResult = levelDebtBackend.revenue?.calculate
    ? levelDebtBackend.revenue.calculate({
        totalDebt,
        termMonths
      })
    : null;

  return {
    id: "level_debt",
    name: "Level Debt",
    qualified: true,
    score,
    scoreLabel: levelDebtBackend.scoring.label(score),
    route: levelDebtBackend.scoring.route(score),
    revenue: revenueResult?.totalRevenue || 0,
    revenueDetail: revenueResult,
    termMonths
  };
}

export function dealRouter(lead) {
  const totalDebt = Number(lead?.totalDebt || 0);
  const preference = getPreference(lead);

  const legacy = evaluateLegacy(lead);
  const consumerShield = evaluateConsumerShield(lead);
  const levelDebt = evaluateLevelDebt(lead);

  // Rule 1: under $4k = no option
  if (totalDebt < 4000) {
    return {
      backend: "NO_MATCH",
      selectedBackendId: null,
      selectedBackendName: null,
      qualified: false,
      score: 0,
      route: "NO_OPTION",
      reason: "Debt below $4,000."
    };
  }

  // Rule 2: $4k–$6k = Consumer Shield only
  if (totalDebt >= 4000 && totalDebt <= 6000) {
    if (consumerShield.qualified) {
      return {
        backend: "CONSUMER_SHIELD",
        selectedBackendId: consumerShield.id,
        selectedBackendName: consumerShield.name,
        ...consumerShield,
        reason: "Debt between $4,000 and $6,000 routes to Consumer Shield."
      };
    }

    return {
      backend: "NO_MATCH",
      selectedBackendId: null,
      selectedBackendName: null,
      qualified: false,
      score: 0,
      route: "NO_OPTION",
      reason: "Debt is in Consumer Shield range, but Consumer Shield is not available."
    };
  }

  // Rule 3: debt validation preference above $6k
  if (totalDebt > 6000 && preference === "debt_validation") {
    if (legacy.qualified) {
      return {
        backend: "LEGACY",
        selectedBackendId: legacy.id,
        selectedBackendName: legacy.name,
        ...legacy,
        reason: "Debt validation preference routes to Legacy first when available."
      };
    }

    if (consumerShield.qualified) {
      return {
        backend: "CONSUMER_SHIELD",
        selectedBackendId: consumerShield.id,
        selectedBackendName: consumerShield.name,
        ...consumerShield,
        reason: "Legacy unavailable, so Consumer Shield is the debt-validation fallback."
      };
    }
  }

  // Rule 4: best fit / normal routing above $6k
  if (levelDebt.qualified) {
    return {
      backend: "LEVEL",
      selectedBackendId: levelDebt.id,
      selectedBackendName: levelDebt.name,
      ...levelDebt,
      reason: "Level Debt is eligible and remains the primary settlement route."
    };
  }

  if (legacy.qualified) {
    return {
      backend: "LEGACY",
      selectedBackendId: legacy.id,
      selectedBackendName: legacy.name,
      ...legacy,
      reason: "Level Debt is not a fit, so Legacy is the next best route."
    };
  }

  if (consumerShield.qualified) {
    return {
      backend: "CONSUMER_SHIELD",
      selectedBackendId: consumerShield.id,
      selectedBackendName: consumerShield.name,
      ...consumerShield,
      reason: "Consumer Shield is the remaining eligible fallback."
    };
  }

  return {
    backend: "NO_MATCH",
    selectedBackendId: null,
    selectedBackendName: null,
    qualified: false,
    score: 0,
    route: "NO_OPTION",
    reason: "No backend matched this scenario."
  };
}
