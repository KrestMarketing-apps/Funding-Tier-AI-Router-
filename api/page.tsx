"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CREDITOR_DB, DISCOVER_LIMIT_PCT } from "@/lib/router-config";
import {
  money,
  routeDecision,
  type RouterCaseData,
  type RouterDecision,
} from "@/lib/router-helpers";

const emptyCase: RouterCaseData = {
  contactId: "",
  opportunityId: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  streetAddress: "",
  city: "",
  state: "",
  zip: "",
  incomeStatus: "",
  monthlyIncome: 0,
  affordablePayment: 0,
  makingPayments: "",
  bankruptcy: "",
  lawsuit: "",
  enrolled: "",
  notes: "",
  pdfUrl: "",
  creditors: [],
};

export default function Page() {
  const searchParams = useSearchParams();
  const contactId = searchParams.get("contactId") || "";

  const [caseData, setCaseData] = useState<RouterCaseData>(emptyCase);
  const [decision, setDecision] = useState<RouterDecision | null>(null);
  const [dbSearch, setDbSearch] = useState("");
  const [status, setStatus] = useState("Waiting for contactId in URL.");
  const [loading, setLoading] = useState(false);

  const totalDebt = useMemo(
    () => caseData.creditors.reduce((sum, c) => sum + Number(c.amount || 0), 0),
    [caseData.creditors]
  );

  const unsecuredDebt = useMemo(
    () =>
      caseData.creditors
        .filter((c) => c.class === "Unsecured")
        .reduce((sum, c) => sum + Number(c.amount || 0), 0),
    [caseData.creditors]
  );

  const securedDebt = useMemo(
    () =>
      caseData.creditors
        .filter((c) => c.class === "Secured")
        .reduce((sum, c) => sum + Number(c.amount || 0), 0),
    [caseData.creditors]
  );

  const unknownDebt = useMemo(
    () =>
      caseData.creditors
        .filter((c) => c.class !== "Unsecured" && c.class !== "Secured")
        .reduce((sum, c) => sum + Number(c.amount || 0), 0),
    [caseData.creditors]
  );

  const discoverPct = useMemo(() => {
    const discover = caseData.creditors
      .filter((c) => c.name.toLowerCase().includes("discover"))
      .reduce((sum, c) => sum + c.amount, 0);
    return unsecuredDebt > 0 ? (discover / unsecuredDebt) * 100 : 0;
  }, [caseData.creditors, unsecuredDebt]);

  async function loadCase() {
    if (!contactId) {
      setStatus("Missing contactId in URL. Open the router like ?contactId=YOUR_CONTACT_ID");
      return;
    }

    try {
      setLoading(true);
      setStatus("Loading live data from GHL...");
      const res = await fetch(`/api/cases/${encodeURIComponent(contactId)}`, {
        cache: "no-store",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to load case");
      }

      setCaseData(data.case);
      setDecision(data.decision);
      setStatus("Loaded live data from GHL.");
    } catch (error: any) {
      setStatus(error.message || "Failed to load case");
    } finally {
      setLoading(false);
    }
  }

  function runRouting() {
    setDecision(routeDecision(caseData));
    setStatus("Routing decision refreshed.");
  }

  async function generatePdfAndSaveUrl() {
    if (!caseData.contactId) {
      setStatus("No contact loaded.");
      return;
    }

    try {
      setLoading(true);
      setStatus("Generating PDF and writing URL back to GHL...");
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contactId: caseData.contactId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to generate PDF");
      }

      setCaseData((prev) => ({
        ...prev,
        pdfUrl: data.pdfUrl,
      }));
      setDecision(data.decision);
      setStatus("PDF generated and AI PROGRAM ESTIMATE-PDF URL updated in GHL.");
    } catch (error: any) {
      setStatus(error.message || "Failed to generate PDF");
    } finally {
      setLoading(false);
    }
  }

  function exportCreditorsCSV() {
    if (!caseData.creditors.length) {
      setStatus("No creditors loaded.");
      return;
    }

    const rows = [
      ["Creditor Name", "Debt Type", "Amount", "Class", "Status"],
      ...caseData.creditors.map((c) => [
        c.name,
        c.type,
        String(c.amount),
        c.class,
        c.status,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `creditors-${caseData.contactId || "case"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    if (contactId) {
      loadCase();
    }
  }, [contactId]);

  const dbResults = CREDITOR_DB.filter((c) => {
    const combined = `${c.name} ${c.category} ${c.class} ${c.notes}`.toLowerCase();
    return combined.includes(dbSearch.toLowerCase());
  });

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <div className="rounded-[18px] bg-gradient-to-r from-teal-700 to-slate-900 p-6 text-white shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
            <h1 className="text-3xl font-extrabold">Funding Tier AI - Deal Router</h1>
            <p className="mt-2 text-slate-200">
              Internal routing tool for debt settlement review, creditor classification, eligibility review, backend recommendation, and PDF output.
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-[18px] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500">Loaded from GHL</div>
              <div className="text-lg font-extrabold text-slate-900">
                {caseData.firstName || caseData.lastName
                  ? `${caseData.firstName} ${caseData.lastName}`.trim()
                  : "No contact loaded"}
              </div>
              <div className="text-sm text-slate-600">
                Contact ID: {caseData.contactId || contactId || "-"} | {caseData.email || "-"} | {caseData.phone || "-"}
              </div>
              <div className="text-sm text-slate-600">
                {[caseData.streetAddress, `${caseData.city} ${caseData.state} ${caseData.zip}`.trim()]
                  .filter(Boolean)
                  .join(", ") || "-"}
              </div>
            </div>
            <div className="text-sm text-slate-600">{status}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <div className="rounded-[18px] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h2 className="text-[20px] font-extrabold text-slate-900">Creditor Entries</h2>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="rounded-xl bg-slate-800 px-4 py-3 font-bold text-white"
                    onClick={loadCase}
                    disabled={loading}
                  >
                    Refresh From GHL
                  </button>
                  <button
                    className="rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white"
                    onClick={exportCreditorsCSV}
                  >
                    Export Creditors CSV
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="min-w-[220px] border-b bg-slate-100 px-3 py-2 text-left text-[13px]">Creditor</th>
                      <th className="min-w-[140px] border-b bg-slate-100 px-3 py-2 text-left text-[13px]">Debt Type</th>
                      <th className="min-w-[130px] border-b bg-slate-100 px-3 py-2 text-left text-[13px]">Amount</th>
                      <th className="min-w-[130px] border-b bg-slate-100 px-3 py-2 text-left text-[13px]">Class</th>
                      <th className="min-w-[120px] border-b bg-slate-100 px-3 py-2 text-left text-[13px]">Status</th>
                      <th className="min-w-[140px] border-b bg-slate-100 px-3 py-2 text-left text-[13px]">Search Match</th>
                    </tr>
                  </thead>
                  <tbody>
                    {caseData.creditors.length ? (
                      caseData.creditors.map((c, idx) => (
                        <tr key={`${c.name}-${idx}`}>
                          <td className="border-b px-3 py-3">{c.name}</td>
                          <td className="border-b px-3 py-3">{c.type}</td>
                          <td className="border-b px-3 py-3">{money(c.amount)}</td>
                          <td className="border-b px-3 py-3">{c.class}</td>
                          <td className="border-b px-3 py-3">{c.status}</td>
                          <td className="border-b px-3 py-3">
                            <span className="inline-block rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">
                              {c.name}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="border-b px-3 py-3 text-slate-500" colSpan={6}>
                          No creditor data loaded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-[18px] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h2 className="text-[20px] font-extrabold text-slate-900">Searchable Internal Creditor Database</h2>
                <input
                  className="w-full rounded-xl border border-slate-300 px-3 py-3 outline-none md:w-96"
                  placeholder="Search creditor name, category, class..."
                  value={dbSearch}
                  onChange={(e) => setDbSearch(e.target.value)}
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border-b bg-slate-100 px-3 py-2 text-left text-[13px]">Creditor Name</th>
                      <th className="border-b bg-slate-100 px-3 py-2 text-left text-[13px]">Category</th>
                      <th className="border-b bg-slate-100 px-3 py-2 text-left text-[13px]">Class</th>
                      <th className="border-b bg-slate-100 px-3 py-2 text-left text-[13px]">Program Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dbResults.length ? (
                      dbResults.map((c) => (
                        <tr key={`${c.name}-${c.category}`}>
                          <td className="border-b px-3 py-3">{c.name}</td>
                          <td className="border-b px-3 py-3">{c.category}</td>
                          <td className="border-b px-3 py-3">{c.class}</td>
                          <td className="border-b px-3 py-3">{c.notes}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="border-b px-3 py-3 text-slate-500" colSpan={4}>
                          No matches found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[18px] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
              <h2 className="mb-4 text-[20px] font-extrabold text-slate-900">Routing Controls</h2>
              <div className="space-y-3">
                <button
                  className="w-full rounded-xl bg-teal-700 px-4 py-3 font-bold text-white"
                  onClick={runRouting}
                  disabled={loading}
                >
                  Run Routing Decision
                </button>
                <button
                  className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white"
                  onClick={loadCase}
                  disabled={loading}
                >
                  Reload From GHL
                </button>
                <button
                  className="w-full rounded-xl bg-amber-500 px-4 py-3 font-bold text-slate-900"
                  onClick={generatePdfAndSaveUrl}
                  disabled={loading}
                >
                  Generate PDF & Save URL to GHL
                </button>
                {caseData.pdfUrl ? (
                  <a
                    href={caseData.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full rounded-xl bg-slate-800 px-4 py-3 text-center font-bold text-white"
                  >
                    Open Saved PDF
                  </a>
                ) : null}
              </div>
            </div>

            <div className="rounded-[18px] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
              <h2 className="mb-4 text-[20px] font-extrabold text-slate-900">Case Metrics</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Total Debt</span><strong>{money(totalDebt)}</strong></div>
                <div className="flex justify-between"><span>Unsecured Debt</span><strong>{money(unsecuredDebt)}</strong></div>
                <div className="flex justify-between"><span>Secured Debt</span><strong>{money(securedDebt)}</strong></div>
                <div className="flex justify-between"><span>Unknown Debt</span><strong>{money(unknownDebt)}</strong></div>
                <div className="flex justify-between"><span>Discover % of Enrolled Debt</span><strong>{discoverPct.toFixed(1)}%</strong></div>
                <div className="flex justify-between"><span>Creditor Count</span><strong>{caseData.creditors.length}</strong></div>
                <div className="flex justify-between"><span>PDF URL Saved</span><strong>{caseData.pdfUrl ? "Yes" : "No"}</strong></div>
              </div>
            </div>

            <div className="rounded-[18px] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
              <h2 className="mb-4 text-[20px] font-extrabold text-slate-900">Routing Result</h2>
              {decision ? (
                <div className="space-y-3 text-sm">
                  <div>
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-bold ${
                        decision.badgeClass === "route-good"
                          ? "bg-green-100 text-green-700"
                          : decision.badgeClass === "route-bad"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {decision.decisionType}
                    </span>
                  </div>
                  <div className="text-lg font-extrabold text-slate-900">{decision.recommended}</div>
                  <div className="space-y-1 text-slate-700">
                    <div><strong>Total Debt:</strong> {money(decision.totalDebt)}</div>
                    <div><strong>Qualifying Unsecured Debt:</strong> {money(decision.unsecured)}</div>
                    <div><strong>Discover %:</strong> {decision.discoverPct.toFixed(1)}%</div>
                    <div><strong>Discover Rule Limit:</strong> {DISCOVER_LIMIT_PCT}%</div>
                  </div>

                  {decision.reasons.length ? (
                    <div className="mt-3">
                      <div className="mb-1 font-bold text-red-700">Blocking Issues</div>
                      <ul className="list-disc pl-5 text-red-700">
                        {decision.reasons.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {decision.warnings.length ? (
                    <div className="mt-3">
                      <div className="mb-1 font-bold text-amber-700">Warnings / Review Items</div>
                      <ul className="list-disc pl-5 text-amber-700">
                        {decision.warnings.map((w) => (
                          <li key={w}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Run the routing decision to see recommendations.</p>
              )}
            </div>

            <div className="rounded-[18px] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
              <h2 className="mb-4 text-[20px] font-extrabold text-slate-900">Backend Logic</h2>
              <div className="space-y-2 text-sm text-slate-700">
                <p><strong>Primary:</strong> Level Debt / Pinnacle model</p>
                <p><strong>Fallback / exception:</strong> Consumer Shield</p>
                <p><strong>Verify Debt Solutions:</strong> no longer used</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Must have serviceable state</li>
                  <li>Must not be in bankruptcy</li>
                  <li>Must not already be enrolled</li>
                  <li>Must have qualifying unsecured debt</li>
                  <li>Must have payment ability or income support</li>
                  <li>Discover concentration can force exception routing</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
