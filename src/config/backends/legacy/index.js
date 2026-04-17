import { qualification } from "./qualification";
import { routing } from "./routing";
import { scoring } from "./scoring";
import { compliance } from "./compliance";
import { commission } from "./commission";
import { objections } from "./objections";
import { crmActions } from "./crmActions";

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
