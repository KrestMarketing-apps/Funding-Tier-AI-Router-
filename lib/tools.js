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

/**
 * role:     "agent" — everyone signed in. "admin" — admins only.
 * section:  groups the menu. Order below is the order shown.
 * href:     path on ai.fundingtier.com, or a full URL for anything external.
 * blurb:    one line, shown on the hub page and as the link's title.
 */
export const TOOLS = [
  // ---- Daily work -------------------------------------------------------
  {
    id: "deal-router",
    label: "Deal Router",
    href: "/",
    section: "Daily work",
    role: "agent",
    blurb: "Decide where a deal should go",
  },
  {
    id: "agent-tools",
    label: "Agent Tools",
    href: "/agent-tools",
    section: "Daily work",
    role: "agent",
    blurb: "Commission simulator and agent utilities",
  },
  {
    id: "call-scripts",
    label: "Program Call Scripts",
    href: "/agents/call-scripts",
    section: "Daily work",
    role: "agent",
    blurb: "Scripts and objection handling",
  },
  {
    id: "debt-estimator",
    label: "Debt Resolution Estimator",
    href: "/agents/legacy-capital-program-calculator",
    section: "Daily work",
    role: "agent",
    blurb: "Estimate a client's programme",
  },
  {
    id: "bonuses",
    label: "Bonuses & Spiffs",
    href: "/agents/bonuses",
    section: "Daily work",
    role: "agent",
    blurb: "Current bonus structure",
  },

  // ---- Admin ------------------------------------------------------------
  {
    id: "profit-engine",
    label: "Profit Engine",
    href: "/profit-engine",
    section: "Admin",
    role: "admin",
    blurb: "Cost, margin and profitability model",
  },
  {
    id: "billable-payout",
    label: "Billable Payout Simulator",
    href: "/admins/legacy-capital-billable-payout-simulator",
    section: "Admin",
    role: "admin",
    blurb: "ELP / Legacy Capital billable vs upfront",
  },
  {
    id: "payout-timing",
    label: "Backend Payout Timing",
    // The clean URL of the file itself. vercel.json also aliases
    // /admins/Backend-Payout-Process to this page, but that rewrite 404s —
    // its destination points at the .html, which cleanUrls has already
    // rewritten away. Link straight at the page and the alias is optional.
    href: "/admins/backend-payout-timing",
    section: "Admin",
    role: "admin",
    blurb: "When backend revenue lands",
  },
  // NOTE: no Operating Model entry. There is no such page in this repo — the
  // only trace of it is a commit that added a redirect and then failed to
  // deploy. Add the page first, then add the row.
  {
    id: "legacy-support",
    label: "Legacy Support",
    href: "/legacy-support",
    section: "Admin",
    role: "admin",
    blurb: "Legacy Capital support reference",
  },
  {
    id: "credit-card-calculator",
    label: "Credit Card Calculator",
    href: "/credit-card-calculator",
    section: "Admin",
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

/** Everything this role may see. Admins see agent tools too. */
export function toolsFor(role) {
  return TOOLS.filter((t) => (role === "admin" ? true : t.role === "agent"));
}

/** Sections in declaration order, each with its visible tools. */
export function sectionsFor(role) {
  const out = [];
  for (const tool of toolsFor(role)) {
    let section = out.find((s) => s.name === tool.section);
    if (!section) out.push((section = { name: tool.section, tools: [] }));
    section.tools.push(tool);
  }
  return out;
}
