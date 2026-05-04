document.addEventListener("DOMContentLoaded", function () {

  const data = window.SCRIPTING_AND_LEAD_HANDLING;
  if (!data) return;

  /* =========================
     ROUTE DETECTION
  ========================= */

  const route = window.CURRENT_ROUTE || window.planRoute || null;

  let programData = null;

  if (route && data.helper) {
    const mapped = data.helper.mapRouteToProgram(route);
    programData = data.programScripts[mapped];
  }

  let activeTimer = null;

  /* =========================
     MAIN DOCKED CONTAINER
  ========================= */

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.right = "0";
  container.style.top = "62%"; // Lower third anchor
  container.style.transform = "translateX(100%) translateY(-50%)";
  container.style.width = "440px";
  container.style.height = "72vh";
  container.style.maxHeight = "750px";
  container.style.background = "#111";
  container.style.color = "#fff";
  container.style.borderTopLeftRadius = "16px";
  container.style.borderBottomLeftRadius = "16px";
  container.style.boxShadow = "-10px 0 30px rgba(0,0,0,0.4)";
  container.style.transition = "transform 0.3s ease";
  container.style.zIndex = "9995";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.fontFamily = "Arial, sans-serif";
  container.style.overflow = "hidden";

  document.body.appendChild(container);

  /* =========================
     HEADER
  ========================= */

  const header = document.createElement("div");
  header.innerText = `🔥 Close Machine${route ? " • " + route : ""}`;
  header.style.padding = "14px";
  header.style.background = "#009f8d";
  header.style.fontWeight = "bold";
  container.appendChild(header);

  /* =========================
     TAB BAR
  ========================= */

  const tabs = document.createElement("div");
  tabs.style.display = "flex";
  tabs.style.background = "#1a1a1a";
  container.appendChild(tabs);

  const content = document.createElement("div");
  content.style.padding = "16px";
  content.style.overflowY = "auto";
  content.style.flex = "1";
  container.appendChild(content);

  const tabNames = ["Program", "Objections", "Warm Transfer", "About"];

  function createCopyButton(text) {
    const btn = document.createElement("button");
    btn.innerText = "Copy";
    btn.style.background = "#009f8d";
    btn.style.color = "#fff";
    btn.style.border = "none";
    btn.style.padding = "6px 10px";
    btn.style.marginTop = "8px";
    btn.style.cursor = "pointer";
    btn.onclick = () => navigator.clipboard.writeText(text);
    return btn;
  }

  /* =========================
     PROGRAM TAB
  ========================= */

  function renderProgram() {
    content.innerHTML = "";

    if (!programData) {
      content.innerHTML = "<p>No active route detected.</p>";
      return;
    }

    const title = document.createElement("h3");
    title.innerText = programData.name;
    content.appendChild(title);

    const script = document.createElement("p");
    script.innerText = programData.script;
    script.style.whiteSpace = "pre-wrap";
    content.appendChild(script);

    content.appendChild(createCopyButton(programData.script));
  }

  /* =========================
     OBJECTIONS TAB
  ========================= */

  function renderObjections() {
    content.innerHTML = "";

    Object.values(data.objections).forEach(obj => {
      const box = document.createElement("div");
      box.style.marginBottom = "15px";
      box.style.padding = "10px";
      box.style.background = "#1f1f1f";
      box.style.borderRadius = "8px";

      const title = document.createElement("strong");
      title.innerText = obj.title;
      box.appendChild(title);

      const script = document.createElement("p");
      script.innerText = obj.script;
      script.style.whiteSpace = "pre-wrap";
      script.style.marginTop = "6px";
      box.appendChild(script);

      box.appendChild(createCopyButton(obj.script));
      content.appendChild(box);
    });
  }

  /* =========================
     WARM TRANSFER TAB
  ========================= */

  function startTimer(seconds) {
    clearInterval(activeTimer);

    let remaining = seconds;

    const timerDisplay = document.createElement("div");
    timerDisplay.style.margin = "10px 0";
    timerDisplay.style.fontWeight = "bold";
    timerDisplay.style.color = "#ff4444";

    content.prepend(timerDisplay);

    activeTimer = setInterval(() => {
      timerDisplay.innerText = `⏱ ${remaining}s remaining`;
      remaining--;

      if (remaining <= 10) {
        timerDisplay.style.color = "#ff0000";
      }

      if (remaining < 0) {
        clearInterval(activeTimer);
        timerDisplay.innerText = "⚠ Time Expired";
      }
    }, 1000);
  }

  function renderWarmTransfer() {
    content.innerHTML = "";

    const tier45 = document.createElement("button");
    tier45.innerText = "Start 45s Rapid Qual";
    tier45.onclick = () => startTimer(45);

    const tier100 = document.createElement("button");
    tier100.innerText = "Start 100s Full Qual";
    tier100.onclick = () => startTimer(100);

    content.appendChild(tier45);
    content.appendChild(tier100);

    const scriptText = `
Rapid Fire Qualification Script:

1. "What is your total unsecured debt amount?
   That includes credit cards, personal loans, and lines of credit.
   No car loans, no mortgage."

2. "Are you currently working or receiving steady income?"

3. "If we restructure this properly, could you commit to at least $250 per month?"

4. "Are you looking to handle this immediately, or are you just exploring options?"

Control the pace. Keep it direct. Stay structured.
`;

    const scriptBlock = document.createElement("p");
    scriptBlock.innerText = scriptText;
    scriptBlock.style.whiteSpace = "pre-wrap";
    scriptBlock.style.marginTop = "15px";

    content.appendChild(scriptBlock);
    content.appendChild(createCopyButton(scriptText));
  }

  /* =========================
     ABOUT TAB
  ========================= */

  function renderAbout() {
    content.innerHTML = "";

    const aboutText = `
Close Machine is a tactical call-control assistant.

Purpose:
• Maintain structure
• Control pacing
• Ensure qualification discipline
• Reduce emotional leakage
• Increase close rates

This tool is not meant for reading scripts.
It is meant to guide execution under pressure.

Use it to:
1. Qualify fast.
2. Transition clean.
3. Lock structure.
4. Close decisively.
`;

    const p = document.createElement("p");
    p.innerText = aboutText;
    p.style.whiteSpace = "pre-wrap";
    content.appendChild(p);
  }

  /* =========================
     TAB SWITCHING
  ========================= */

  const renderMap = {
    "Program": renderProgram,
    "Objections": renderObjections,
    "Warm Transfer": renderWarmTransfer,
    "About": renderAbout
  };

  tabNames.forEach(name => {
    const tab = document.createElement("div");
    tab.innerText = name;
    tab.style.flex = "1";
    tab.style.padding = "10px";
    tab.style.cursor = "pointer";
    tab.style.textAlign = "center";
    tab.onclick = () => renderMap[name]();
    tabs.appendChild(tab);
  });

  renderProgram();

  /* =========================
     DOCK TOGGLE BUTTON
  ========================= */

  const dockToggle = document.createElement("div");
  dockToggle.innerText = "Close Machine";
  dockToggle.style.position = "fixed";
  dockToggle.style.right = "0";
  dockToggle.style.top = "62%";
  dockToggle.style.transform = "translateY(-50%)";
  dockToggle.style.background = "#009f8d";
  dockToggle.style.color = "#fff";
  dockToggle.style.padding = "14px 22px";
  dockToggle.style.cursor = "pointer";
  dockToggle.style.fontWeight = "bold";
  dockToggle.style.borderTopLeftRadius = "10px";
  dockToggle.style.borderBottomLeftRadius = "10px";
  dockToggle.style.zIndex = "9996";

  document.body.appendChild(dockToggle);

  let open = false;

  dockToggle.onclick = () => {
    open = !open;
    container.style.transform = open
      ? "translateX(0%) translateY(-50%)"
      : "translateX(100%) translateY(-50%)";
  };

});
