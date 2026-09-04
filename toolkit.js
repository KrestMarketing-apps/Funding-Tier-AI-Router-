// Funding Tier Toolkit — the shared header.
//
// Drop one line into any tool and it gets the same navigation:
//
//   <script src="https://ai.fundingtier.com/toolkit.js" defer></script>
//
// Design notes worth knowing before editing:
//
//   Shadow DOM. These tools each carry their own CSS, written years apart.
//   A header in the light DOM would inherit their styles and leak its own.
//   Everything below lives in a shadow root so neither can happen.
//
//   Hidden inside the CRM. When a tool is framed in GoHighLevel the CRM
//   already supplies navigation, and a second header inside the first is
//   just clutter. So the toolkit renders only at the top level.
//
//   The menu is not the gate. It shows what this person may open, but the
//   middleware is what actually refuses. Hiding a link is courtesy; the
//   lock is elsewhere.
//
//   Two groups, not five. Every tool belongs to exactly one audience:
//   Agents or Admins. The menu mirrors that — one collapsible group each,
//   Admins first for admins because that is what they came for. Anything
//   the API hands back that is neither is treated as an agent tool, so a
//   mislabelled section degrades into something usable rather than hiding.

(function () {
  "use strict";

  // Framed inside GoHighLevel — the CRM's own chrome is the navigation there.
  if (window.self !== window.top) return;
  if (document.getElementById("ft-toolkit")) return; // already mounted

  var HEIGHT = 52;
  var STORE = "ft.toolkit.collapsed"; // remembered per browser, not per session

  var CSS = `
    :host { all: initial; }
    * { box-sizing: border-box; }

    /* --- Bar -------------------------------------------------------------
       Dark glass over the page rather than a solid slab: the tool underneath
       stays faintly visible, which keeps a fixed header from feeling like a
       lid. The gradient hairline is the one loud element; everything else is
       quiet so it stays readable over eleven differently-coloured tools. */
    .bar {
      position: fixed; top: 0; left: 0; right: 0; height: ${HEIGHT}px;
      display: flex; align-items: center; gap: 10px; padding: 0 14px;
      background:
        radial-gradient(120% 240% at 0% 0%, var(--tint-a), transparent 60%),
        radial-gradient(120% 240% at 100% 0%, var(--tint-b), transparent 60%),
        var(--glass);
      -webkit-backdrop-filter: saturate(170%) blur(18px);
      backdrop-filter: saturate(170%) blur(18px);
      font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
      font-size: 14px; color: var(--text); z-index: 2147483000;
      box-shadow: 0 1px 0 var(--line), 0 14px 34px -24px rgba(0,0,0,.9);
    }
    /* Luminous rule: brand gradient, fading out at both ends. */
    .bar::after {
      content: ""; position: absolute; left: 0; right: 0; bottom: -1px; height: 2px;
      background: linear-gradient(90deg,
        transparent, var(--g1) 12%, var(--g2) 42%, var(--g3) 68%, transparent);
      opacity: var(--rule-alpha);
    }

    .brand { display: flex; align-items: center; gap: 10px; text-decoration: none;
             color: var(--text); font-weight: 650; letter-spacing: -.012em;
             padding: 5px 6px 5px 4px; border-radius: 9px; white-space: nowrap; }
    .brand:hover { background: var(--hover); }
    /* Gradient ring around the mark, drawn as a padded backdrop. */
    .brand .ring { width: 30px; height: 30px; border-radius: 9px; flex: none;
                   padding: 1.5px; background: linear-gradient(135deg, var(--g2), var(--g3));
                   display: block; }
    .brand img { width: 100%; height: 100%; border-radius: 7.5px; display: block;
                 background: var(--surface); }
    .brand span.wordmark { font-size: 14.5px;
                  background: linear-gradient(92deg, var(--text) 26%, var(--g2));
                  -webkit-background-clip: text; background-clip: text;
                  -webkit-text-fill-color: transparent; }

    .sep { width: 1px; height: 20px; flex: none;
           background: linear-gradient(180deg, transparent, var(--line-strong), transparent); }

    .here { color: var(--mid); font-weight: 600; white-space: nowrap;
            overflow: hidden; text-overflow: ellipsis; max-width: 32vw;
            letter-spacing: .01em; }

    .spacer { flex: 1 1 auto; }

    button.trigger, a.chip {
      position: relative; display: inline-flex; align-items: center; gap: 7px;
      font: inherit; font-weight: 600; color: var(--text);
      background: var(--chip); border: 1px solid var(--line-strong);
      border-radius: 9px; padding: 7px 11px; cursor: pointer;
      text-decoration: none; white-space: nowrap;
      transition: border-color .15s ease, background .15s ease, box-shadow .15s ease;
    }
    button.trigger:hover, a.chip:hover {
      background: var(--hover); border-color: var(--g1);
      box-shadow: 0 0 0 3px var(--ring-soft);
    }
    button.trigger[aria-expanded="true"] {
      border-color: var(--g2); background: var(--hover);
      box-shadow: 0 0 0 3px var(--ring-soft);
    }
    button.trigger:focus-visible, a.chip:focus-visible, .item:focus-visible,
    .brand:focus-visible, .signout:focus-visible, .ghead:focus-visible {
      outline: 2px solid var(--g2); outline-offset: 2px;
    }

    .caret { width: 8px; height: 8px; border-right: 2px solid currentColor;
             border-bottom: 2px solid currentColor; transform: rotate(45deg) translate(-2px,-2px);
             opacity: .5; flex: none; }

    .avatar { width: 25px; height: 25px; border-radius: 50%; flex: none;
              display: grid; place-items: center; font-size: 10.5px; font-weight: 700;
              background: linear-gradient(135deg, var(--g2), var(--g3));
              color: #04191c; letter-spacing: .02em;
              box-shadow: 0 1px 8px -1px var(--ring-soft); }

    /* --- Popovers -------------------------------------------------------- */
    .pop {
      position: fixed; top: ${HEIGHT + 8}px;
      background:
        radial-gradient(120% 70% at 0% 0%, var(--tint-a), transparent 62%),
        radial-gradient(120% 70% at 100% 0%, var(--tint-b), transparent 62%),
        var(--pop);
      -webkit-backdrop-filter: saturate(170%) blur(22px);
      backdrop-filter: saturate(170%) blur(22px);
      border: 1px solid var(--line-strong); border-radius: 14px; padding: 6px;
      box-shadow: 0 1px 0 var(--edge-hi) inset, 0 24px 56px -14px rgba(0,0,0,.75);
      z-index: 2147483001; min-width: 300px; max-height: calc(100vh - ${HEIGHT + 26}px);
      overflow: auto; font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
      color: var(--text);
    }
    .pop[hidden] { display: none; }

    /* --- Collapsible groups ---------------------------------------------- */
    .group + .group { margin-top: 4px; }
    .group { border-radius: 11px; }
    .group.admin { background: var(--admin-wash); border: 1px solid var(--admin-line); }
    .group.admin > .ghead { padding-top: 9px; }

    .ghead {
      display: flex; align-items: center; gap: 8px; width: 100%;
      font: inherit; color: var(--dim); background: transparent; border: 0;
      padding: 10px 10px 7px; border-radius: 10px; cursor: pointer; text-align: left;
      transition: color .12s ease, background .12s ease;
    }
    .ghead:hover { color: var(--text); background: var(--hover); }
    .gname { font-size: 10px; font-weight: 700; letter-spacing: .13em;
             text-transform: uppercase; }
    .group.admin .gname {
      background: linear-gradient(92deg, var(--g2), var(--g3));
      -webkit-background-clip: text; background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .gcount { font-size: 10px; font-weight: 700; line-height: 1;
              padding: 3px 6px; border-radius: 999px; color: var(--dim);
              background: var(--chip); border: 1px solid var(--line); }
    .grule { flex: 1 1 auto; height: 1px;
             background: linear-gradient(90deg, var(--line-strong), transparent); }
    .gcaret { width: 7px; height: 7px; flex: none; opacity: .6;
              border-right: 2px solid currentColor; border-bottom: 2px solid currentColor;
              transform: rotate(45deg) translate(-1px,-1px);
              transition: transform .18s ease; }
    .ghead[aria-expanded="false"] .gcaret { transform: rotate(-45deg) translate(-1px,1px); }

    .glist { padding: 0 2px 6px; }
    .glist[hidden] { display: none; }

    .item { position: relative; display: block; text-decoration: none; color: var(--text);
            padding: 9px 10px 9px 12px; border-radius: 9px; line-height: 1.35;
            transition: background .12s ease; }
    .item:hover { background: var(--hover); }
    .item .t { font-weight: 600; display: flex; align-items: center; gap: 7px; }
    .item .b { font-size: 12.5px; color: var(--dim); margin-top: 1px; }

    /* Current page: tinted, with a gradient rail rather than a flat bar. */
    .item[aria-current="page"] { background: var(--accent-soft); }
    .item[aria-current="page"]::before {
      content: ""; position: absolute; left: 3px; top: 8px; bottom: 8px; width: 3px;
      border-radius: 2px; background: linear-gradient(180deg, var(--g2), var(--g3));
    }
    .item[aria-current="page"] .t { color: var(--accent-ink); }

    .tag { font-size: 9.5px; font-weight: 700; letter-spacing: .06em;
           text-transform: uppercase; padding: 2px 6px; border-radius: 999px;
           background: var(--warn-soft); color: var(--warn); border: 1px solid var(--warn-line); }

    .who { padding: 11px 10px 12px; margin-bottom: 6px; border-radius: 10px;
           background: linear-gradient(135deg, var(--accent-soft), transparent 70%);
           border: 1px solid var(--line); }
    .who .n { font-weight: 650; letter-spacing: -.01em; }
    .who .e { font-size: 12.5px; color: var(--dim); word-break: break-all; margin-top: 1px; }
    .role { display: inline-block; margin-top: 8px; font-size: 9.5px; font-weight: 700;
            letter-spacing: .11em; text-transform: uppercase; padding: 3px 9px;
            border-radius: 999px; color: #04191c;
            background: linear-gradient(135deg, var(--g2), var(--g3)); }

    .signout { display: block; width: 100%; text-align: left; font: inherit;
               font-weight: 600; color: var(--danger); background: transparent;
               border: 0; border-radius: 9px; padding: 9px 10px; cursor: pointer; }
    .signout:hover { background: var(--danger-soft); }

    @media (max-width: 640px) {
      .brand span.wordmark, .here, .sep { display: none; }
      .label-crm { display: none; }
      .pop { left: 8px !important; right: 8px; min-width: 0; }
    }
    @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }

    /* --- Tokens ----------------------------------------------------------
       Brand teal through to deep cyan, on a near-black ground.

       Pinned dark, deliberately. The header is chrome, not page content: it
       reads as a distinct surface above whichever tool is underneath, the way
       an app bar does. The tools themselves are light and stay that way, so
       following the viewer's OS here would only make the chrome flicker
       between matching and clashing for no gain. */
    :host {
      --g1:#2ED3C4; --g2:#3FE0CF; --g3:#1B8FA8;

      --glass: rgba(7,17,21,.86);
      --pop:   rgba(9,21,26,.94);
      --tint-a: rgba(63,224,207,.10);
      --tint-b: rgba(27,143,168,.14);
      --edge-hi: rgba(255,255,255,.06);

      --surface:#0b1418; --chip: rgba(255,255,255,.045);
      --line: rgba(255,255,255,.08); --line-strong: rgba(255,255,255,.14);
      --hover: rgba(255,255,255,.07);

      --text:#e8f1f2; --mid:#a9bcc0; --dim:#7d9296;

      --accent-ink:#7ef0e1; --accent-soft: rgba(63,224,207,.13);
      --ring-soft: rgba(63,224,207,.20);
      --admin-wash: rgba(27,143,168,.10);
      --admin-line: rgba(63,224,207,.16);

      --warn:#e8bd6f; --warn-soft: rgba(232,189,111,.12); --warn-line: rgba(232,189,111,.28);
      --danger:#f39387; --danger-soft: rgba(243,147,135,.12);
      --rule-alpha:1;
    }
  `;

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    for (var k in attrs || {}) {
      if (k === "text") n.textContent = attrs[k];
      else if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { n.appendChild(c); });
    return n;
  }

  function initials(name, email) {
    var src = (name || email || "").trim();
    if (!src) return "?";
    var parts = src.split(/[\s@._-]+/).filter(Boolean);
    return ((parts[0] || "")[0] + (parts[1] || "")[0] || src[0]).toUpperCase();
  }

  /** Same page? Compare paths, ignoring a trailing slash. */
  function isHere(href) {
    if (!href || href.charAt(0) !== "/") return false;
    var a = location.pathname.replace(/\/$/, "") || "/";
    var b = href.replace(/\/$/, "") || "/";
    return a === b;
  }

  function isAdminish(s) { return /admin/i.test(s || ""); }

  /* Collapsed groups persist per browser. Storage is a convenience, not a
     dependency — a browser that refuses it just opens with the defaults. */
  function readCollapsed() {
    try { return JSON.parse(localStorage.getItem(STORE)) || {}; }
    catch (e) { return {}; }
  }
  function writeCollapsed(map) {
    try { localStorage.setItem(STORE, JSON.stringify(map)); } catch (e) {}
  }

  /**
   * Two groups, in the order this person needs them.
   *
   * The API may hand back any number of sections; they collapse to Agents
   * and Admins here so the menu shape does not drift when the registry is
   * edited. An admin sees Admins first — that is the work they opened the
   * menu for — with Agents underneath, still reachable.
   */
  function toGroups(data) {
    var viewerIsAdmin = isAdminish(data.user && data.user.role);
    var agents = [], admins = [];

    (data.sections || []).forEach(function (s) {
      (s.tools || []).forEach(function (t) {
        // Prefer the tool's own role; fall back to the section it arrived in.
        var adminOnly = isAdminish(t.role) || isAdminish(t.section) || isAdminish(s.name);
        (adminOnly ? admins : agents).push(t);
      });
    });

    var groups = [];
    // Defence in depth: the API should already withhold these, but never
    // render an admin group to someone who is not one.
    if (admins.length && viewerIsAdmin) {
      groups.push({ key: "admins", name: "Admins", admin: true, tools: admins });
    }
    if (agents.length) {
      groups.push({ key: "agents", name: "Agents", admin: false, tools: agents });
    }
    return groups;
  }

  function mount(data) {
    var host = el("div", { id: "ft-toolkit" });
    document.body.appendChild(host);
    var root = host.attachShadow({ mode: "open" });
    root.appendChild(el("style", { text: CSS }));

    var groups = toGroups(data);

    // --- current tool name, for the bar ---
    var current = null;
    groups.forEach(function (g) {
      g.tools.forEach(function (t) { if (isHere(t.href)) current = t; });
    });

    // --- tools popover ---
    var collapsed = readCollapsed();
    var pop = el("div", { class: "pop", role: "menu", hidden: "" });

    groups.forEach(function (g) {
      var holdsCurrent = g.tools.some(function (t) { return isHere(t.href); });
      // A group is open unless it was closed by hand — and the group holding
      // the current page is always open, so you can see where you are.
      var open = holdsCurrent || !collapsed[g.key];

      var list = el("div", { class: "glist", role: "group" });
      g.tools.forEach(function (t) {
        var title = el("div", { class: "t" }, [el("span", { text: t.label })]);
        if (t.wip) title.appendChild(el("span", { class: "tag", text: "WIP" }));
        var item = el("a", {
          class: "item", href: t.href, role: "menuitem",
          "aria-current": isHere(t.href) ? "page" : null,
        }, [title]);
        if (t.blurb) item.appendChild(el("div", { class: "b", text: t.blurb }));
        list.appendChild(item);
      });
      if (!open) list.hidden = true;

      var head = el("button", {
        class: "ghead", type: "button", "aria-expanded": open ? "true" : "false",
      }, [
        el("span", { class: "gname", text: g.name }),
        el("span", { class: "gcount", text: String(g.tools.length) }),
        el("span", { class: "grule" }),
        el("span", { class: "gcaret" }),
      ]);

      head.addEventListener("click", function (e) {
        e.stopPropagation();
        var nowOpen = list.hidden;
        list.hidden = !nowOpen;
        head.setAttribute("aria-expanded", nowOpen ? "true" : "false");
        collapsed[g.key] = !nowOpen;
        writeCollapsed(collapsed);
      });

      pop.appendChild(el("div", { class: "group" + (g.admin ? " admin" : "") }, [head, list]));
    });

    var toolsBtn = el("button", {
      class: "trigger", type: "button", "aria-expanded": "false", "aria-haspopup": "menu",
    }, [el("span", { text: "Tools" }), el("span", { class: "caret" })]);

    // --- account popover ---
    var who = el("div", { class: "who" }, [
      el("div", { class: "n", text: data.user.name || data.user.email }),
      el("div", { class: "e", text: data.user.email }),
      el("span", { class: "role", text: data.user.role }),
    ]);
    var signout = el("button", { class: "signout", type: "button", text: "Sign out" });
    var accPop = el("div", { class: "pop", hidden: "" }, [who, signout]);

    var accBtn = el("button", {
      class: "trigger", type: "button", "aria-expanded": "false", "aria-haspopup": "menu",
      "aria-label": "Account",
    }, [
      el("span", { class: "avatar", text: initials(data.user.name, data.user.email) }),
      el("span", { class: "caret" }),
    ]);

    // --- bar ---
    var bar = el("div", { class: "bar" }, [
      // Brand always returns to "/" — the Router, which is where signing in
      // lands you too. One home, reachable from every tool.
      el("a", { class: "brand", href: "/", title: "Funding Tier Tools — Router" }, [
        el("span", { class: "ring" }, [el("img", { src: "/apple-touch-icon.png", alt: "" })]),
        el("span", { class: "wordmark", text: "Funding Tier Tools" }),
      ]),
      el("div", { class: "sep" }),
      el("div", { class: "here", text: current ? current.label : "" }),
      el("div", { class: "spacer" }),
      toolsBtn,
      el("a", {
        class: "chip", href: data.crm.href, target: "_blank", rel: "noopener",
        title: "Open " + data.crm.label,
      }, [el("span", { class: "label-crm", text: "CRM" }), el("span", { text: "↗" })]),
      accBtn,
    ]);

    root.appendChild(bar);
    root.appendChild(pop);
    root.appendChild(accPop);

    // --- open/close ---
    function place(popup, trigger) {
      // Narrow screens get the full-width treatment from CSS. Setting inline
      // positions here would beat the media query and pin it to one side.
      if (window.innerWidth <= 640) {
        popup.style.left = "";
        popup.style.right = "";
        return;
      }
      var r = trigger.getBoundingClientRect();
      popup.style.left = "auto";
      popup.style.right = Math.max(8, window.innerWidth - r.right) + "px";
    }
    function close(popup, trigger) {
      popup.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
    }
    function closeAll() { close(pop, toolsBtn); close(accPop, accBtn); }
    function toggle(popup, trigger) {
      var open = popup.hidden;
      closeAll();
      if (open) {
        place(popup, trigger);
        popup.hidden = false;
        trigger.setAttribute("aria-expanded", "true");
      }
    }

    toolsBtn.addEventListener("click", function (e) { e.stopPropagation(); toggle(pop, toolsBtn); });
    accBtn.addEventListener("click", function (e) { e.stopPropagation(); toggle(accPop, accBtn); });
    root.addEventListener("click", function (e) { e.stopPropagation(); });
    document.addEventListener("click", closeAll);
    window.addEventListener("resize", closeAll);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeAll();
    });

    signout.addEventListener("click", function () {
      signout.textContent = "Signing out…";
      fetch("/api/auth/signout", { headers: { accept: "application/json" } })
        .catch(function () {})
        .then(function () { location.href = "/login"; });
    });

    // Push the page down rather than sitting on top of it. Tools that already
    // have their own fixed header will need their offset nudged by HEIGHT.
    document.documentElement.style.setProperty("--ft-toolkit-height", HEIGHT + "px");
    var pad = parseFloat(getComputedStyle(document.body).paddingTop) || 0;
    document.body.style.paddingTop = pad + HEIGHT + "px";
  }


  /* ─────────────────────────────────────────────────────────────────────────
     HERO BAND
     The same band ToolShell renders in the two Next apps, for the pages that
     are plain HTML. Shadow DOM again, so a page's own CSS cannot reach in and
     the band's cannot leak out — but the host sits in normal flow rather than
     fixed, so it pushes content rather than covering it.

     A page opts in by declaring, before this script loads:

       window.FT_TOOL = {
         eyebrow: "ADMIN · PAYOUT TIMING",
         title:   "Billable Payout Simulator",
         subtitle:"…",
         badge:   { text: "ADMIN ONLY" },        // optional; style defaults to mode
         metrics: [{ label, value, accent }],    // optional
         slotSelector: "#hero-controls"          // optional: an existing element
       };                                        // is projected into the band

     `mode` is never declared by the page — it comes from the same /api/me role
     this script already reads for the tool menu, so the chrome cannot disagree
     with itself about who is looking.
     ───────────────────────────────────────────────────────────────────────── */

  var HERO_CSS = `
    /* flow-root, not block: a slotted element's own margin would otherwise
       collapse out through the host and push the whole band down the page. */
    :host { display: flow-root; }
    .hero {
      position: relative; overflow: hidden;
      font-family: -apple-system, "Inter", Segoe UI, Helvetica, Arial, sans-serif;
      background:
        radial-gradient(120% 140% at 88% -20%, #17435a 0%, transparent 58%),
        radial-gradient(90% 110% at -10% 115%, rgba(20,184,166,0.22) 0%, transparent 62%),
        linear-gradient(150deg, #0b1622 0%, #0e1e2b 60%, #0e1e2b 100%);
      padding: 30px 28px 26px;
      border-bottom: 1px solid rgba(255,255,255,0.09);
    }
    .hero::before {
      content: ""; position: absolute; pointer-events: none;
      top: -45%; right: -20%; width: 65%; height: 170%;
      background: radial-gradient(closest-side, #3d7f9c, transparent);
      opacity: 0.16; filter: blur(60px);
    }
    .top { position: relative; display: flex; align-items: center; justify-content: space-between;
           gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }
    .eyebrow { display: flex; align-items: center; gap: 8px; }
    .eyebrowIcon { width: 20px; height: 20px; border-radius: 6px; background: rgba(255,255,255,0.08);
                   display: flex; align-items: center; justify-content: center; font-size: 11px; }
    .eyebrowText { font-size: 11.5px; font-weight: 700; letter-spacing: 0.02em;
                   color: rgba(245,248,247,0.86); text-shadow: 0 1px 2px rgba(0,0,0,0.35); }
    .badge { font-size: 10.5px; font-weight: 700; padding: 4px 10px; border-radius: 999px; letter-spacing: 0.02em; }
    .badge.admin { background: rgba(61,220,111,0.16); color: #3ddc6f; border: 1px solid rgba(61,220,111,0.4); }
    .badge.agent { background: rgba(61,157,255,0.16); color: #3d9dff; border: 1px solid rgba(61,157,255,0.4); }
    .badge.wip   { background: rgba(245,165,36,0.15); color: #f5a524; border: 1px solid rgba(245,165,36,0.3); }
    h1 { position: relative; font-size: 25px; font-weight: 700; color: #f5f8f7; margin: 0 0 6px; letter-spacing: -0.01em; }
    p  { position: relative; font-size: 13.5px; color: rgba(245,248,247,0.86); max-width: 600px;
         line-height: 1.5; margin: 0 0 18px; text-shadow: 0 1px 2px rgba(0,0,0,0.3); }
    .slot { position: relative; margin-top: 4px; }
    .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; }
    .metric { background: rgba(255,255,255,0.045); border: 1px solid rgba(255,255,255,0.1);
              border-radius: 8px; padding: 12px 14px; border-left: 2px solid #3d7f9c; }
    .mlabel { font-size: 10px; font-weight: 800; letter-spacing: 0.04em; color: rgba(245,248,247,0.68);
              margin-bottom: 6px; text-shadow: 0 1px 2px rgba(0,0,0,0.4); }
    .mvalue { font-size: 19px; font-weight: 700; color: #f5f8f7; }
    .hero[data-mode="admin"] .eyebrowIcon, .hero[data-mode="admin"] .accent { color: #3ddc6f; }
    .hero[data-mode="agent"] .eyebrowIcon, .hero[data-mode="agent"] .accent { color: #3d9dff; }
    .hero[data-mode="admin"] .metric { border-left-color: #3ddc6f; }
    .hero[data-mode="agent"] .metric { border-left-color: #3d9dff; }
    @media (max-width: 640px) { .hero { padding: 22px 16px 20px; } }
  `;

  function mountHero(data) {
    var cfg = window.FT_TOOL;
    if (!cfg || !cfg.title) return;   // pages opt in; silence otherwise

    var mode = isAdminish(data.user && data.user.role) ? "admin" : "agent";

    var host = el("div", { id: "ft-hero" });
    // First child of body, so it lands directly under the fixed bar. The
    // inline style is belt and braces for the same margin-collapse problem:
    // the shadow root's :host rule cannot contain a margin that escapes
    // before the shadow tree is attached.
    host.style.display = "flow-root";
    document.body.insertBefore(host, document.body.firstChild);
    var root = host.attachShadow({ mode: "open" });
    root.appendChild(el("style", { text: HERO_CSS }));

    var hero = el("div", { class: "hero" });
    hero.setAttribute("data-mode", mode);

    var top = el("div", { class: "top" });
    var eye = el("div", { class: "eyebrow" });
    eye.appendChild(el("div", { class: "eyebrowIcon", text: "\u25C6" }));
    eye.appendChild(el("span", { class: "eyebrowText", text: cfg.eyebrow || "" }));
    top.appendChild(eye);
    if (cfg.badge && cfg.badge.text) {
      top.appendChild(el("span", {
        class: "badge " + (cfg.badge.style || mode),
        text: cfg.badge.text,
      }));
    }
    hero.appendChild(top);

    hero.appendChild(el("h1", { text: cfg.title }));
    if (cfg.subtitle) hero.appendChild(el("p", { text: cfg.subtitle }));

    if (cfg.metrics && cfg.metrics.length) {
      var grid = el("div", { class: "metrics" });
      cfg.metrics.forEach(function (m) {
        var c = el("div", { class: "metric" });
        c.appendChild(el("div", { class: "mlabel", text: m.label }));
        c.appendChild(el("div", { class: "mvalue" + (m.accent ? " accent" : ""), text: m.value }));
        grid.appendChild(c);
      });
      hero.appendChild(el("div", { class: "slot" })).appendChild(grid);
    }

    /* A page with live controls keeps them: the existing element is projected
       into the band through a slot, so its own scripts and event listeners
       carry on working against the same nodes. Nothing is cloned or rebuilt. */
    if (cfg.slotSelector) {
      var live = document.querySelector(cfg.slotSelector);
      if (live) {
        live.setAttribute("slot", "live");
        var wrap = el("div", { class: "slot" });
        wrap.appendChild(el("slot", { name: "live" }));
        hero.appendChild(wrap);
        host.appendChild(live);
      }
    }

    root.appendChild(hero);
  }

  function start() {
    fetch("/api/me", { headers: { accept: "application/json" } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        // Not signed in, or the endpoint is unavailable — show nothing rather
        // than an empty shell. Middleware will have redirected anyone who
        // needed a session to reach this page in the first place.
        if (data && data.ok && data.user) {
          mount(data);
          // The band is decoration; a page that misconfigures it should still
          // render. The outer catch would swallow this silently otherwise.
          try { mountHero(data); }
          catch (e) { if (window.console) console.warn("[ft-toolkit] hero:", e); }
        }
      })
      .catch(function (e) {
        // Was silent. A header that fails to render is worth a console line —
        // it is the difference between "the API is down" and "we shipped a bug".
        if (window.console) console.warn("[ft-toolkit]", e);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
