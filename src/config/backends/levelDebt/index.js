import { qualification } from "./qualification";
import { routing } from "./routing";
import { scoring } from "./scoring";
import { compliance } from "./compliance";
import { revenue } from "./revenue";
import { agentcommission } from "./agentcommission";
import { objections } from "./objections";
import { crmActions } from "./crmActions";
import { knowledgebase } from "./knowledgebase";

export const levelDebtBackend = {
  id: "level_debt",
  name: "Level Debt",
  type: "debt_settlement",
  display: {
    label: "Level Debt",
    shortLabel: "LD",
    description: "Debt settlement backend with state-based model rules."
  },
  qualification,
  routing,
  scoring,
  compliance,
  revenue,
  agentcommission,
  objections,
  crmActions,
  knowledgebase
};
