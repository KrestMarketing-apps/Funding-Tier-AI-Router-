import { backendVisibilityService } from "@/services/backendVisibilityService";
import { backendKnowledgeService } from "@/services/backendKnowledgeService";
import { dealRouter } from "@/tools/dealRouter";

function normalize(text) {
  return String(text || "").trim().toLowerCase();
}

function formatCreditorResults(results) {
  return results.map((item) => {
    const status = item.result?.status || "unknown";
    const rule = item.result?.rule || "No specific rule found.";

    return {
      backendId: item.backendId,
      backendName: item.backendName,
      status,
      rule
    };
  });
}

export const universalAssistant = {
  answer(question, context = {}, permissions = { includeInternal: false }) {
    const q = normalize(question);

    // Block internal-only topics
    if (
      (q.includes("revenue") ||
        q.includes("profit") ||
        q.includes("margin") ||
        q.includes("payout optimization") ||
        q.includes("company profitability")) &&
      !permissions.includeInternal
    ) {
      return {
        type: "restricted",
        answer: "That information is internal-only."
      };
    }

    // Backend summary/info
    if (context.backend) {
      const backend = backendVisibilityService.getBackendView(context.backend, {
        includeInternal: permissions.includeInternal
      });

      if (!backend) {
        return {
          type: "error",
          answer: "Backend not found."
        };
      }

      if (
        q.includes("summary") ||
        q.includes("tell me about") ||
        q.includes("what is") ||
        q.includes("knowledge base")
      ) {
        return {
          type: "backend_info",
          answer: backend.knowledgebase || backend
        };
      }
    }

    // Available backends
    if (q.includes("what backends") || q.includes("available backends")) {
      return {
        type: "backend_list",
        answer: backendKnowledgeService.getBackendSummaries()
      };
    }

    // Minimums
    if (q.includes("minimum") || q.includes("minimum debt")) {
      return {
        type: "minimums",
        answer: backendKnowledgeService.getMinimums()
      };
    }

    // Objections
    if (
      (q.includes("objection") || q.includes("how do i respond")) &&
      context.backend &&
      context.objectionKey
    ) {
      return {
        type: "objection",
        answer: backendKnowledgeService.getObjection(
          context.backend,
          context.objectionKey
        )
      };
    }

    // Creditor checks
    if (
      (q.includes("creditor") || q.includes("accepted") || q.includes("allow")) &&
      context.creditorName
    ) {
      return {
        type: "creditor_check",
        answer: formatCreditorResults(
          backendKnowledgeService.checkCreditorAcrossBackends(
            context.creditorName,
            {
              debtType: context.debtType,
              isSecured: context.isSecured,
              accountType: context.accountType
            }
          )
        )
      };
    }

    // Route lead
    if (
      q.includes("route this lead") ||
      q.includes("where should this go") ||
      q.includes("which backend")
    ) {
      return {
        type: "routing",
        answer: dealRouter(context.lead || {})
      };
    }

    // Compare backend fields
    if (q.includes("compare") && context.fieldPath) {
      return {
        type: "comparison",
        answer: backendKnowledgeService.compareBackendField(context.fieldPath)
      };
    }

    return {
      type: "fallback",
      answer:
        "I need more context like a backend name, creditor name, objection key, field path, or lead details."
    };
  }
};
