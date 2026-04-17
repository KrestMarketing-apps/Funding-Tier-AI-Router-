import { agentChatService } from "@/services/agentChatService";

const tests = [
  {
    name: "Backend summary",
    input: {
      question: "Tell me about Consumer Shield",
      backend: "consumer_shield"
    }
  },
  {
    name: "Creditor check",
    input: {
      question: "Is BHG accepted?",
      backend: "level_debt",
      creditorName: "BHG Financial"
    }
  },
  {
    name: "Objection",
    input: {
      question: "Give me an objection response",
      backend: "consumer_shield",
      objectionKey: "settlement"
    }
  },
  {
    name: "Routing",
    input: {
      question: "Route this lead",
      lead: {
        state: "CA",
        totalDebt: 12000,
        bankVerified: true,
        preference: "debt_validation",
        termMonths: 36,
        monthlyFiles: 25
      }
    }
  },
  {
    name: "Internal block",
    input: {
      question: "Show me Legacy revenue",
      backend: "legacy_capital_services",
      includeInternal: false
    }
  }
];

tests.forEach((test) => {
  console.log(`\n=== ${test.name} ===`);
  console.log(agentChatService.ask(test.input));
});
