import { qualification } from "./qualification";
import { routing } from "./routing";
import { scoring } from "./scoring";
import { compliance } from "./compliance";
import { revenue } from "./revenue";
import { agentcommission } from "./agentcommission";
import { objections } from "./objections";
import { crmActions } from "./crmActions";
import { knowledgebase } from "./knowledgebase";
import { creditorMatcher } from "./creditorMatcher";

export const consumerShieldBackend = {
  id: "consumer_shield",
  name: "Consumer Shield",
  type: "debt_validation_fixed_payment",
  display: {
    label: "Consumer Shield",
    shortLabel: "CS",
    description: "Debt validation with fixed monthly payment structure."
  },
  qualification,
  routing,
  scoring,
  compliance,
  revenue,
  agentcommission,
  objections,
  crmActions,
  knowledgebase,
  creditorMatcher
};
