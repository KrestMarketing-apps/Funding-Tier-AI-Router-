import fs from "fs";
import path from "path";

function normalizeText(value = "") {
  return String(value).trim().toLowerCase();
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];

  const headers = lines[0].split(",").map(h => h.trim());

  return lines.slice(1).map(line => {
    const values = line.split(",").map(v => v.trim());
    const row = {};
    headers.forEach((header, i) => {
      row[header] = values[i] ?? "";
    });
    return row;
  });
}

function loadCreditors() {
  const filePath = path.join(process.cwd(), "lib", "creditors.csv");

  if (!fs.existsSync(filePath)) {
    return [];
  }

  const csvText = fs.readFileSync(filePath, "utf8");
  return parseCsv(csvText);
}

export default function handler(req, res) {
  if (req.method === "GET") {
    const search = normalizeText(req.query.search || "");
    const creditors = loadCreditors();

    if (!search) {
      return res.status(200).json({
        ok: true,
        total: creditors.length,
        results: creditors.slice(0, 25),
      });
    }

    const results = creditors.filter(row => {
      const creditorName = normalizeText(row.creditor_name || row.name || "");
      const alias = normalizeText(row.alias || "");
      const category = normalizeText(row.category || "");
      const classification = normalizeText(row.classification || "");

      return (
        creditorName.includes(search) ||
        alias.includes(search) ||
        category.includes(search) ||
        classification.includes(search)
      );
    });

    return res.status(200).json({
      ok: true,
      search,
      total: results.length,
      results: results.slice(0, 50),
    });
  }

  if (req.method === "POST") {
    const body = req.body || {};
    const search = normalizeText(body.search || body.creditor || "");
    const creditors = loadCreditors();

    const results = creditors.filter(row => {
      const creditorName = normalizeText(row.creditor_name || row.name || "");
      const alias = normalizeText(row.alias || "");
      return creditorName.includes(search) || alias.includes(search);
    });

    return res.status(200).json({
      ok: true,
      search,
      total: results.length,
      results: results.slice(0, 50),
    });
  }

  return res.status(405).json({
    ok: false,
    message: "Method not allowed",
  });
}
