import { agentChatService } from "@/services/agentChatService";

console.log("=== BACKENDS ===");
console.log(
  agentChatService.ask({
    question: "What backends are available?"
  })
);

console.log("=== SUMMARY ===");
console.log(
  agentChatService.ask({
    question: "Tell me about Consumer Shield",
    backend: "consumer_shield"
  })
);

console.log("=== CREDITOR CHECK ===");
console.log(
  agentChatService.ask({
    question: "Is BHG accepted?",
    creditorName: "BHG Financial"
  })
);

console.log("=== ROUTING ===");
console.log(
  agentChatService.ask({
    question: "Route this lead",
    lead: {
      state: "CA",
      totalDebt: 12000,
      preference: "debt_validation"
    }
  })
);

console.log("=== INTERNAL BLOCK ===");
console.log(
  agentChatService.ask({
    question: "Show me Legacy revenue",
    backend: "legacy_capital_services",
    includeInternal: false
  })
);
