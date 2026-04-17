import { backendEngine } from "../services/backendEngine";

export function dealRouter(lead) {
  const legacy = backendEngine.evaluateLead(
    "legacy_capital_services",
    lead
  );

  if (legacy.qualified) {
    return {
      backend: "LEGACY",
      ...legacy
    };
  }

  return {
    backend: "NO_MATCH",
    route: "MANUAL_REVIEW"
  };
}
