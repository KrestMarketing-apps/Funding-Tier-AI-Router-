import { qualification } from "./qualification";
import { routing } from "./routing";
import { scoring } from "./scoring";
import { compliance } from "./compliance";
import { revenue } from "./revenue";
import { objections } from "./objections";
import { crmActions } from "./crmActions";
import { agentcommission } from "./agentcommission";

export const legacyBackend = {
  id: "legacy_capital_services",
  name: "Legacy Capital Services",
  type: "attorney_model_creditor_resolution",
  qualification,
  routing,
  scoring,
  compliance,
  commission,
  objections,
  crmActions
};
import logo from "@/assets/logos/legacy-logo.png";

export const legacyBackend = {
  id: "legacy_capital_services",
  name: "Legacy Capital Services",

  display: {
    label: "Legacy Capital Services",
    logo
  },

  // rest...
};
