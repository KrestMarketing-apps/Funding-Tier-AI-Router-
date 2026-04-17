import { backendKnowledgeService } from "@/services/backendKnowledgeService";
import { dealRouter } from "@/tools/dealRouter";

function normalize(text) {
  return String(text || "").trim().toLowerCase();
}

export const universalAssistant = {
  answer(question, context = {}) {
    const q = normalize(question);

    // backend summaries
    if (q.includes("what backends") || q.includes("available backends")) {
      const backends = backendKnowledgeService.getBackendSummaries();
      return {
        type: "summary",
        answer: backends.map((b) => `${b.name}: ${b.description}`).join("\n")
      };
    }

    // creditor checks
    if (q.includes("creditor") || q.includes("is ") && q.includes(" accepted")) {
      const creditorName = context.creditorName || question;
      const results = backendKnowledgeService.checkCreditorAcrossBackends(
        creditorName,
        {
          debtType: context.debtType,
          isSecured: context.isSecured,
          accountType: context.accountType
        }
      );

      return {
        type: "creditor_check",
        answer: results
      };
    }

    // objection handling
    if (q.includes("objection") || q.includes("how do i respond")) {
      if (context.backend && context.objectionKey) {
        const objection = backendKnowledgeService.getObjection(
          context.backend,
          context.objectionKey
        );

        return {
          type: "objection",
          answer: objection || "No objection response found."
        };
      }
    }

    // route a lead
    if (q.includes("where should this go") || q.includes("route this lead")) {
      const result = dealRouter(context.lead || {});
      return {
        type: "routing",
        answer: result
      };
    }

    // backend-specific summary
    if (context.backend) {
      const kb = backendKnowledgeService.getKnowledgebase(context.backend);
      if (kb) {
        return {
          type: "knowledgebase",
          answer: kb
        };
      }
    }

    return {
      type: "fallback",
      answer: "I could not confidently answer that yet. Add more context like backend name, creditor name, debt type, or lead details."
    };
  }
};
