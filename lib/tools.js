// The tool directory. One list, one place to edit.
//
// This is what fills the toolkit header for everyone, filtered by role before
// it ever leaves the server — an agent's browser never receives the admin
// entries, so the menu is not a map of what to go guessing at.
//
// TO ADD A TOOL: add a row here, and add a matching rule in middleware.ts.
// The two are deliberately separate: this list decides what people SEE, and
// middleware decides what they can REACH. A tool missing from this file is
// still protected; a tool missing from middleware is still locked by the
// default-deny rule. Neither omission can open anything up.
//
// TWO SECTIONS, NOT MORE. Every tool belongs to exactly one audience, and the
// section names match the roles: "Agents" and "Admins". The old "Daily work"
// split cut across that — it grouped by when you use a thing rather than who
// may use it, so the menu said one thing and the gate said another. If a new
// tool does not obviously belong to one of these two, that is a sign the tool
// needs a decision about who it is for, not that the menu needs a third group.

/**
 * role:     "agent" — everyone signed in. "admin" — admins only.
 * section:  "Agents" or "Admins". Order within a section is the order shown.
 * href:     path on ai.fundingtier.com, or a full URL for anything external.
 * blurb:    one line, shown on the hub page and under the link in the menu.
 */
export const TOOLS = [
  // ---- Agents -----------------------------------------------------------
  {
    id: "call-scripts",
    label: "Call Flow + Call Scripts",
    href: "/agents/call-scripts",
    section: "Agents",
    role: "agent",
    blurb: "Call flow, scripts and objection handling",
  },
  {
    id: "deal-router",
    label: "Router",
    href: "/",
    section: "Agents",
    role: "agent",
    // The four things the router actually decides, named here because they
    // are sections inside the one page rather than pages of their own.
    blurb: "Rules, creditors, program availability, comparison",
  },
  {
    id: "debt-settlement-enrollment",
    label: "Debt Settlement Enrollment (SOP)",
    href: "/agents/debt-settlement/level-debt/forth/enrollment-process",
    section: "Agents",
    role: "agent",
    blurb: "Forth walkthrough, eligibility rules, compliance email",
  },
  {
    id: "commission-bonuses-spiffs",
    label: "Commission, Bonuses & Spiffs",
    // Replaces the old commission-simulator and bonuses entries — both are
    // now one page. /agents/commission-simulator and /agents/bonuses redirect
    // here via vercel.json for anyone with an old link or bookmark.
    // /agent-tools itself is untouched — that's what the GoHighLevel
    // Marketplace custom page points at, separate from this menu entry.
    href: "/agents/commission-bonuses-spiffs",
    section: "Agents",
    role: "agent",
    blurb: "Full payout math for every product, plus every bonus and SPIFF",
  },

  // ---- Admins -----------------------------------------------------------
  {
    id: "operating-model",
    label: "Operating Model",
    // Served by the funding-tier-profit-engine project and proxied in by the
    // rewrite in vercel.json — there is no page for it in this repo.
    href: "/admins/operating-model",
    section: "Admins",
    role: "admin",
    blurb: "Headcount, capacity and the shape of the business",
  },
  {
    id: "profit-engine",
    label: "Profit Engine",
    href: "/profit-engine",
    section: "Admins",
    role: "admin",
    blurb: "Cost, margin and profitability model",
  },
  {
    id: "payout-timing",
    label: "Backend Payout System",
    // The clean URL of the file itself. vercel.json also aliases
    // /admins/Backend-Payout-Process to this page, but that rewrite 404s —
    // its destination points at the .html, which cleanUrls has already
    // rewritten away. Link straight at the page and the alias is optional.
    href: "/admins/backend-payout-timing",
    section: "Admins",
    role: "admin",
    blurb: "When backend revenue lands",
  },
  {
    id: "billable-payout",
    label: "LCS/ELP — Billable Payout Simulator",
    href: "/admins/legacy-capital-billable-payout-simulator",
    section: "Admins",
    role: "admin",
    blurb: "Billable vs upfront",
  },
  {
    id: "legacy-support",
    label: "LCS/ELP — Support",
    href: "/legacy-support",
    section: "Admins",
    role: "admin",
    blurb: "Legacy Capital support reference",
  },
  {
    id: "credit-card-calculator",
    label: "Credit Card Calculator",
    href: "/credit-card-calculator",
    section: "Admins",
    role: "admin",
    blurb: "Payoff modelling — still being built",
    wip: true,
  },
];

/**
 * Back to the CRM. Kept here rather than hard-coded into the header so the
 * white-label domain and sub-account live in one place.
 */
export const CRM = {
  label: "Krest Marketing App",
  href: `https://app.krestmarketing.com/v2/location/${
    process.env.GHL_LOCATION_ID || ""
  }/dashboard`,
};

/**
 * Section order, admin-first.
 *
 * An admin opening the menu is nearly always after an admin tool — the agent
 * tools are the ones they use least. Agents never see the Admins group at all,
 * so for them this ordering is invisible and the list simply starts at Agents.
 */
const SECTION_ORDER = ["Admins", "Agents"];

/** Everything this role may see. Admins see agent tools too. */
export function toolsFor(role) {
  return TOOLS.filter((t) => (role === "admin" ? true : t.role === "agent"));
}

/** Sections in SECTION_ORDER, each with its visible tools in list order. */
export function sectionsFor(role) {
  const visible = toolsFor(role);
  const out = [];
  for (const name of SECTION_ORDER) {
    const tools = visible.filter((t) => t.section === name);
    if (tools.length) out.push({ name, tools });
  }
  // Anything with an unrecognised section still gets shown rather than
  // silently dropped — a typo in a new row should be visible, not invisible.
  const known = new Set(SECTION_ORDER);
  for (const tool of visible) {
    if (known.has(tool.section)) continue;
    let section = out.find((s) => s.name === tool.section);
    if (!section) out.push((section = { name: tool.section, tools: [] }));
    section.tools.push(tool);
  }
  return out;
}
