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

(function () {
  "use strict";

  // Framed inside GoHighLevel — the CRM's own chrome is the navigation there.
  if (window.self !== window.top) return;
  if (document.getElementById("ft-toolkit")) return; // already mounted

  var HEIGHT = 52;

  var CSS = `
    :host { all: initial; }
    * { box-sizing: border-box; }

    /* --- Bar -------------------------------------------------------------
       Glass over the page rather than a solid slab: the tool underneath stays
       faintly visible, which keeps a fixed header from feeling like a lid.
       The gradient hairline is the one loud element; everything else is quiet
       so it stays readable over eleven differently-coloured tools. */
    .bar {
      position: fixed; top: 0; left: 0; right: 0; height: ${HEIGHT}px;
      display: flex; align-items: center; gap: 10px; padding: 0 14px;
      background: var(--glass);
      -webkit-backdrop-filter: saturate(180%) blur(16px);
      backdrop-filter: saturate(180%) blur(16px);
      font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
      font-size: 14px; color: var(--text); z-index: 2147483000;
      box-shadow: 0 1px 0 var(--line), 0 10px 30px -22px rgba(2,24,26,.55);
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
    .brand span { font-size: 14.5px;
                  background: linear-gradient(92deg, var(--text) 30%, var(--g1));
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
    .brand:focus-visible, .signout:focus-visible {
      outline: 2px solid var(--g1); outline-offset: 2px;
    }

    .caret { width: 8px; height: 8px; border-right: 2px solid currentColor;
             border-bottom: 2px solid currentColor; transform: rotate(45deg) translate(-2px,-2px);
             opacity: .5; flex: none; }

    .avatar { width: 25px; height: 25px; border-radius: 50%; flex: none;
              display: grid; place-items: center; font-size: 10.5px; font-weight: 700;
              background: linear-gradient(135deg, var(--g2), var(--g3));
              color: #fff; letter-spacing: .02em;
              box-shadow: 0 1px 6px -1px var(--ring-soft); }

    /* --- Popovers -------------------------------------------------------- */
    .pop {
      position: fixed; top: ${HEIGHT + 8}px; background: var(--pop);
      -webkit-backdrop-filter: saturate(180%) blur(20px);
      backdrop-filter: saturate(180%) blur(20px);
      border: 1px solid var(--line-strong); border-radius: 14px; padding: 8px;
      box-shadow: 0 2px 4px rgba(2,24,26,.06), 0 18px 44px -12px rgba(2,24,26,.32);
      z-index: 2147483001; min-width: 280px; max-height: calc(100vh - ${HEIGHT + 26}px);
      overflow: auto; font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
    }
    .pop[hidden] { display: none; }

    .sect { padding: 11px 10px 6px; font-size: 10px; font-weight: 700;
            letter-spacing: .13em; text-transform: uppercase; color: var(--dim); }

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
            border-radius: 999px; color: #fff;
            background: linear-gradient(135deg, var(--g2), var(--g3)); }

    .signout { display: block; width: 100%; text-align: left; font: inherit;
               font-weight: 600; color: var(--danger); background: transparent;
               border: 0; border-radius: 9px; padding: 9px 10px; cursor: pointer; }
    .signout:hover { background: var(--danger-soft); }

    @media (max-width: 640px) {
      .brand span, .here, .sep { display: none; }
      .label-crm { display: none; }
      .pop { left: 8px !important; right: 8px; min-width: 0; }
    }
    @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }

    /* --- Tokens ----------------------------------------------------------
       Brand teal through to deep cyan. Defined light-first, redefined whole
       for dark, so no colour is ever left resolving against the wrong ground. */
    :host {
      --g1:#0F8F86; --g2:#17B8AC; --g3:#0B6B7A;
      --glass: rgba(255,255,255,.82);
      --pop: rgba(255,255,255,.92);
      --surface:#fff; --chip: rgba(255,255,255,.6);
      --line:#e4e9f0; --line-strong:#d3dbe5; --hover:#eef4f6;
      --text:#0f1720; --mid:#46535f; --dim:#6b7986;
      --accent-ink:#0b6b64; --accent-soft:#e4f4f2; --ring-soft: rgba(23,184,172,.18);
      --warn:#8a5a05; --warn-soft:#fcf3e0; --warn-line:#e6d2a6;
      --danger:#a8322a; --danger-soft:#fbeae8;
      --rule-alpha:.75;
    }
    /* Pinned light, deliberately.
       This bar sits on top of eleven existing tools, and those tools have
       their own fixed colours — mostly light. Following the viewer's OS would
       put a dark glass header over a white page for anyone on a dark machine,
       which reads as broken rather than as a theme.

       To follow the OS again, wrap the dark values below in
       @media (prefers-color-scheme: dark) and drop them back in — but only
       once the tools themselves are theme-aware, or you get the mismatch.

         --g1:#2ED3C4; --g2:#3FE0CF; --g3:#1B8FA8;
         --glass: rgba(11,17,23,.74);  --pop: rgba(16,23,31,.92);
         --surface:#0f151c;            --chip: rgba(255,255,255,.03);
         --line:#1e2731; --line-strong:#2b3742; --hover:#18212a;
         --text:#e6edf3; --mid:#a3b1bf; --dim:#7a8896;
         --accent-ink:#6fe3d6; --accent-soft:rgba(46,211,196,.12);
         --ring-soft: rgba(46,211,196,.16);
         --warn:#e0b45f; --warn-soft:#2b2416; --warn-line:#584824;
         --danger:#f08b80; --danger-soft:#331d1b;
         --rule-alpha:1;
    */
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

  function mount(data) {
    var host = el("div", { id: "ft-toolkit" });
    document.body.appendChild(host);
    var root = host.attachShadow({ mode: "open" });
    root.appendChild(el("style", { text: CSS }));

    // --- current tool name, for the bar ---
    var current = null;
    (data.sections || []).forEach(function (s) {
      s.tools.forEach(function (t) { if (isHere(t.href)) current = t; });
    });

    // --- tools popover ---
    var pop = el("div", { class: "pop", role: "menu", hidden: "" });
    (data.sections || []).forEach(function (s) {
      pop.appendChild(el("div", { class: "sect", text: s.name }));
      s.tools.forEach(function (t) {
        var title = el("div", { class: "t" }, [el("span", { text: t.label })]);
        if (t.wip) title.appendChild(el("span", { class: "tag", text: "WIP" }));
        var item = el("a", {
          class: "item", href: t.href, role: "menuitem",
          "aria-current": isHere(t.href) ? "page" : null,
        }, [title]);
        if (t.blurb) item.appendChild(el("div", { class: "b", text: t.blurb }));
        pop.appendChild(item);
      });
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
      // Brand always returns to "/" — the Deal Router, which is where
      // signing in lands you too. One home, reachable from every tool.
      el("a", { class: "brand", href: "/", title: "Funding Tier Tools \u2014 Deal Router" }, [
        el("span", { class: "ring" }, [el("img", { src: "/apple-touch-icon.png", alt: "" })]),
        el("span", { text: "Funding Tier Tools" }),
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

  function start() {
    fetch("/api/me", { headers: { accept: "application/json" } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        // Not signed in, or the endpoint is unavailable — show nothing rather
        // than an empty shell. Middleware will have redirected anyone who
        // needed a session to reach this page in the first place.
        if (data && data.ok && data.user) mount(data);
      })
      .catch(function () {});
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
