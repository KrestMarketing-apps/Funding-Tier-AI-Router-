import { backendRegistry } from "@/services/backendRegistry";

const PUBLIC_FIELDS = [
  "id",
  "name",
  "type",
  "display",
  "qualification",
  "routing",
  "scoring",
  "compliance",
  "objections",
  "crmActions",
  "knowledgebase",
  "creditorMatcher",
  "agentcommission"
];

const INTERNAL_FIELDS = [
  "revenue"
];

export const backendVisibilityService = {
  getBackendView(backendIdOrName, options = {}) {
    const { includeInternal = false } = options;

    const backend =
      backendRegistry.getById?.(backendIdOrName) ||
      backendRegistry.getByName?.(backendIdOrName);

    if (!backend) return null;

    const allowedFields = includeInternal
      ? [...PUBLIC_FIELDS, ...INTERNAL_FIELDS]
      : PUBLIC_FIELDS;

    const filtered = {};

    for (const key of allowedFields) {
      if (backend[key] !== undefined) {
        filtered[key] = backend[key];
      }
    }

    return filtered;
  },

  getAllBackendViews(options = {}) {
    const backends = backendRegistry.getAll?.() || [];
    return backends.map((backend) =>
      this.getBackendView(backend.id, options)
    );
  }
};
