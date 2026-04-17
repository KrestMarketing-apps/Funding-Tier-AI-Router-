import { universalAssistant } from "@/ai/universalAssistant";

export const agentChatService = {
  ask({ question, backend = null, lead = null, creditorName = null, debtType = null, isSecured = false, accountType = null, objectionKey = null, includeInternal = false }) {
    return universalAssistant.answer(
      question,
      {
        backend,
        lead,
        creditorName,
        debtType,
        isSecured,
        accountType,
        objectionKey
      },
      {
        includeInternal
      }
    );
  }
};
