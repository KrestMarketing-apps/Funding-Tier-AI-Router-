import { backendRegistry } from "@/services/backendRegistry";

export const backendKnowledgeService = {
  getBackendSummaries() {
    return backendRegistry.getAll().map((backend) => ({
      id: backend.id,
      name: backend.name,
      type: backend.type,
      description: backend.display?.description || backend.knowledgebase?.summary || ""
    }));
  },

  getKnowledgebase(backendNameOrId) {
    const backend =
      backendRegistry.getById(backendNameOrId) ||
      backendRegistry.getByName(backendNameOrId);

    if (!backend) return null;
    return backend.knowledgebase || null;
  },

  getObjection(backendNameOrId, objectionKey) {
    const backend =
      backendRegistry.getById(backendNameOrId) ||
      backendRegistry.getByName(backendNameOrId);

    if (!backend?.objections?.get) return null;
    return backend.objections.get(objectionKey);
  },

  checkCreditorAcrossBackends(creditorName, options = {}) {
    return backendRegistry.getAll().map((backend) => {
      const result = backend.creditorMatcher?.findMatch
        ? backend.creditorMatcher.findMatch(creditorName, options)
        : {
            matched: false,
            status: "unknown",
            rule: null
          };

      return {
        backendId: backend.id,
        backendName: backend.name,
        result
      };
    });
  },

  getMinimums() {
    return backendRegistry.getAll().map((backend) => ({
      backendId: backend.id,
      backendName: backend.name,
      minimums: backend.knowledgebase?.minimums || null
    }));
  },

  compareBackendField(fieldPath) {
    const path = String(fieldPath || "").split(".");
    return backendRegistry.getAll().map((backend) => {
      let current = backend;
      for (const key of path) {
        current = current?.[key];
      }

      return {
        backendId: backend.id,
        backendName: backend.name,
        value: current ?? null
      };
    });
  }
};
