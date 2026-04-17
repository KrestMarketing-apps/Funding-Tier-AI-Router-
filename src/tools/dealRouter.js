import { backendEngine } from "@/services/backendEngine";

export function dealRouter(lead) {
  const result = backendEngine.evaluateLead(lead);

  if (result.qualified) {
    return {
      backend: "LEGACY",
      ...result
    };
  }

  return {
    backend: "NO_MATCH",
    ...result
  };
}
