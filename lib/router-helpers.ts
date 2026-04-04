import {
  CREDITOR_DB,
  CONSUMER_SHIELD_NON_SERVICEABLE,
  DEFAULT_MIN_PAYMENT,
  DISCOVER_LIMIT_PCT,
  NON_SERVICEABLE_LEVEL,
} from "./router-config";

export type RouterCreditor = {
  name: string;
  type: string;
  amount: number;
  class: string;
  status: string;
};

export type RouterCaseData = {
  contactId: string;
  opportunityId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  incomeStatus: string;
  monthlyIncome: number;
  affordablePayment: number;
  makingPayments: string;
  bankruptcy: string;
  lawsuit: string;
  enrolled: string;
  notes: string;
  pdfUrl: string;
  creditors: RouterCreditor[];
};

export type RouterDecision = {
  totalDebt: number;
  unsecured: number;
  discoverPct: number;
  recommended: string;
  badgeClass: string;
  decisionType: string;
  reasons: string[];
  warnings: string[];
  serviceableLevel: boolean;
  serviceableConsumerShield: boolean;
};

export function money(val: number) {
  return Number(val || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function toSafeString(value: unknown) {
  return String(value ?? "").trim();
}

export function toAmount(value: unknown) {
  const cleaned = String(value ?? "").replace(/\$/g, "").replace(/,/g, "").trim();
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
}

export function findCreditorMatch(name: string) {
  const n = String(name || "").trim().toLowerCase();
  if (!n) return null;
  return (
    CREDITOR_DB.find((c) => c.name.toLowerCase() === n) ||
    CREDITOR_DB.find((c) => n.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(n)) ||
    null
  );
}

export function classifyDebtType(type: string, name: string) {
  const creditorMatch = findCreditorMatch(name);
  if (creditorMatch) return creditorMatch.class;

  const t = String(type || "").toLowerCase();
  const nm = String(name || "").toLowerCase();

  if (
    t.includes("credit") ||
    t.includes("card") ||
    t.includes("personal loan") ||
    t.includes("collection") ||
    t.includes("medical")
  ) {
    return "Unsecured";
  }

  if (
    t.includes("mortgage") ||
    t.includes("heloc") ||
    t.includes("auto") ||
    t.includes("vehicle") ||
    t.includes("title")
  ) {
    return "Secured";
  }

  if (t.includes("student") || t.includes("tax")) return "Generally Excluded";
  if (nm.includes("discover")) return "Unsecured";
  return "Unknown";
}

function normalizeCustomFieldList(contact: any): any[] {
  if (Array.isArray(contact?.customFields)) return contact.customFields;
  if (Array.isArray(contact?.custom_fields)) return contact.custom_fields;
  if (Array.isArray(contact?.customField)) return contact.customField;
  return [];
}

function normalizeFieldNames(field: any): string[] {
  return [field?.id, field?.key, field?.fieldKey, field?.name, field?.fieldName, field?.slug]
    .filter(Boolean)
    .map((v) => String(v).trim().toLowerCase());
}

function normalizeFieldValue(field: any) {
  if (field?.value !== undefined && field?.value !== null) return field.value;
  if (field?.fieldValue !== undefined && field?.fieldValue !== null) return field.fieldValue;
  if (field?.field_value !== undefined && field?.field_value !== null) return field.field_value;
  if (Array.isArray(field?.values) && field.values.length) return field.values[0];
  return "";
}

export function getCustomFieldValue(contact: any, candidates: string[]) {
  const lowered = candidates.map((c) => c.trim().toLowerCase());
  const fields = normalizeCustomFieldList(contact);

  for (const field of fields) {
    const names = normalizeFieldNames(field);
    if (lowered.some((candidate) => names.includes(candidate))) {
      return normalizeFieldValue(field);
    }
  }

  for (const candidate of candidates) {
    if (contact?.[candidate] !== undefined && contact?.[candidate] !== null) {
      return contact[candidate];
    }
  }

  return "";
}

export function mapGhlContactToRouterCase(contact: any): RouterCaseData {
  const creditors: RouterCreditor[] = [];

  for (let i = 1; i <= 6; i++) {
    const name = toSafeString(
      getCustomFieldValue(contact, [`creditor_${i}`, `Creditor ${i}`])
    );
    const amount = toAmount(
      getCustomFieldValue(contact, [
        `creditor_${i}__estimated_balance`,
        `Creditor ${i} - Estimated Balance`,
      ])
    );

    if (name) {
      creditors.push({
        name,
        type: "Other",
        amount,
        class: classifyDebtType("Other", name),
        status: "Open",
      });
    }
  }

  return {
    contactId: toSafeString(contact?.id || contact?._id),
    opportunityId: toSafeString(contact?.opportunityId || contact?.opportunity_id),
    firstName: toSafeString(contact?.firstName || contact?.first_name),
    lastName: toSafeString(contact?.lastName || contact?.last_name),
    email: toSafeString(contact?.email),
    phone: toSafeString(contact?.phone),
    streetAddress: toSafeString(contact?.address1 || contact?.address),
    city: toSafeString(contact?.city),
    state: toSafeString(contact?.state),
    zip: toSafeString(contact?.postalCode || contact?.postal_code || contact?.zip),
    incomeStatus: toSafeString(
      getCustomFieldValue(contact, ["income_status", "Employment / Income Status"])
    ),
    monthlyIncome: toAmount(
      getCustomFieldValue(contact, ["monthly_income", "Monthly Gross Income"])
    ),
    affordablePayment: toAmount(
      getCustomFieldValue(contact, ["affordable_payment", "Estimated Affordable Program Payment"])
    ),
    makingPayments: toSafeString(
      getCustomFieldValue(contact, ["making_payments", "Currently Making Payments?"])
    ),
    bankruptcy: toSafeString(
      getCustomFieldValue(contact, ["bankruptcy", "In Bankruptcy?"])
    ),
    lawsuit: toSafeString(
      getCustomFieldValue(contact, ["lawsuit", "Active Lawsuit?"])
    ),
    enrolled: toSafeString(
      getCustomFieldValue(contact, ["enrolled", "Already Enrolled in Debt Relief?"])
    ),
    notes: toSafeString(
      getCustomFieldValue(contact, ["notes", "Internal Notes"])
    ),
    pdfUrl: toSafeString(
      getCustomFieldValue(contact, ["ai_program_estimatepdf_url", "AI PROGRAM ESTIMATE-PDF URL"])
    ),
    creditors,
  };
}

export function routeDecision(data: RouterCaseData): RouterDecision {
  const unsecured = data.creditors
    .filter((c) => c.class === "Unsecured")
    .reduce((sum, c) => sum + c.amount, 0);

  const discoverDebt = data.creditors
    .filter((c) => String(c.name).toLowerCase().includes("discover"))
    .reduce((sum, c) => sum + c.amount, 0);

  const discoverPct = unsecured > 0 ? (discoverDebt / unsecured) * 100 : 0;
  const affordablePayment = Number(data.affordablePayment || 0);
  const hasIncome = data.incomeStatus && data.incomeStatus !== "No Income";
  const serviceableLevel = !!data.state && !NON_SERVICEABLE_LEVEL.includes(data.state);
  const serviceableConsumerShield =
    !!data.state && !CONSUMER_SHIELD_NON_SERVICEABLE.includes(data.state);

  const reasons: string[] = [];
  const warnings: string[] = [];
  let recommended = "";
  let badgeClass = "route-warn";
  let decisionType = "Manual Review";

  if (!data.state) reasons.push("State not selected");
  if (!data.incomeStatus) reasons.push("Income status not selected");
  if (!data.makingPayments) reasons.push("Payment status not selected");
  if (!data.bankruptcy) reasons.push("Bankruptcy status not selected");
  if (!data.enrolled) reasons.push("Enrollment status not selected");

  if (data.bankruptcy === "Yes") reasons.push("Client is in bankruptcy");
  if (data.enrolled === "Yes") reasons.push("Client is already enrolled in a debt relief program");
  if (unsecured < 4000) reasons.push("Qualifying unsecured debt appears under $4,000");
  if (!hasIncome && affordablePayment < DEFAULT_MIN_PAYMENT) {
    reasons.push("No income and payment ability below minimum");
  }
  if (affordablePayment > 0 && affordablePayment < DEFAULT_MIN_PAYMENT) {
    warnings.push(`Affordable payment below preferred threshold of ${money(DEFAULT_MIN_PAYMENT)}`);
  }
  if (data.lawsuit === "Yes") warnings.push("Active lawsuit present - review manually");
  if (data.makingPayments === "No") {
    warnings.push("Not currently making payments - still review, but may reduce fit");
  }
  if (discoverPct > DISCOVER_LIMIT_PCT) {
    warnings.push(`Discover concentration exceeds ${DISCOVER_LIMIT_PCT}% of unsecured debt`);
  }

  if (reasons.length > 0) {
    recommended = "Not Eligible / Do Not Route Yet";
    badgeClass = "route-bad";
    decisionType = "Stop";
  } else if (serviceableLevel && discoverPct <= DISCOVER_LIMIT_PCT) {
    recommended = "Route to Level Debt / Pinnacle";
    badgeClass = "route-good";
    decisionType = "Primary Route";
  } else if (serviceableConsumerShield) {
    recommended = "Route to Consumer Shield Exception Flow";
    badgeClass = "route-warn";
    decisionType = "Fallback Route";
  } else {
    recommended = "Manual Escalation Required";
    badgeClass = "route-bad";
    decisionType = "Escalation";
  }

  return {
    totalDebt: data.creditors.reduce((sum, c) => sum + c.amount, 0),
    unsecured,
    discoverPct,
    recommended,
    badgeClass,
    decisionType,
    reasons,
    warnings,
    serviceableLevel,
    serviceableConsumerShield,
  };
}

export function buildPdfTextLines(data: RouterCaseData, result: RouterDecision) {
  return [
    "Funding Tier AI - Deal Router Summary",
    "",
    `Contact ID: ${data.contactId || "-"}`,
    `Client: ${`${data.firstName} ${data.lastName}`.trim() || "-"}`,
    `Phone: ${data.phone || "-"}`,
    `Email: ${data.email || "-"}`,
    `Address: ${[data.streetAddress, `${data.city}, ${data.state} ${data.zip}`.trim()].filter(Boolean).join(", ") || "-"}`,
    `Income Status: ${data.incomeStatus || "-"}`,
    `Monthly Income: ${money(data.monthlyIncome)}`,
    `Affordable Payment: ${money(data.affordablePayment)}`,
    `Making Payments: ${data.makingPayments || "-"}`,
    `Bankruptcy: ${data.bankruptcy || "-"}`,
    `Lawsuit: ${data.lawsuit || "-"}`,
    `Already Enrolled: ${data.enrolled || "-"}`,
    "",
    `Routing Recommendation: ${result.recommended}`,
    `Decision Type: ${result.decisionType}`,
    `Total Debt: ${money(result.totalDebt)}`,
    `Qualifying Unsecured Debt: ${money(result.unsecured)}`,
    `Discover %: ${result.discoverPct.toFixed(1)}%`,
    "",
    "Creditors:",
    ...data.creditors.map(
      (c, idx) =>
        `${idx + 1}. ${c.name} | ${c.type} | ${money(c.amount)} | ${c.class} | ${c.status}`
    ),
    "",
    "Blocking Issues:",
    ...(result.reasons.length ? result.reasons.map((r) => `- ${r}`) : ["- None"]),
    "",
    "Warnings / Review Items:",
    ...(result.warnings.length ? result.warnings.map((w) => `- ${w}`) : ["- None"]),
    "",
    "Notes:",
    data.notes || "-",
  ];
}

function escapePdfText(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

export function buildSimplePdfBuffer(data: RouterCaseData, result: RouterDecision) {
  const lines = buildPdfTextLines(data, result);
  let y = 760;
  const contentLines = ["BT", "/F1 11 Tf"];

  for (const line of lines) {
    contentLines.push(`50 ${y} Td (${escapePdfText(line)}) Tj`);
    y -= 14;
    contentLines.push("0 0 Td");
    if (y < 60) break;
  }

  contentLines.push("ET");
  const contentStream = contentLines.join("\n");

  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj",
    `4 0 obj\n<< /Length ${Buffer.byteLength(contentStream, "utf8")} >>\nstream\n${contentStream}\nendstream\nendobj`,
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];

  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${obj}\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "utf8");
}
