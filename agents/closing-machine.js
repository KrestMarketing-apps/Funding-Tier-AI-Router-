document.addEventListener("DOMContentLoaded", function () {

  const data = window.SCRIPTING_AND_LEAD_HANDLING;
  if (!data) return;

  const route = window.CURRENT_ROUTE || "LEVEL";
  const mappedProgramKey = data.helper.mapRouteToProgram(route);
  const programData = data.programScripts[mappedProgramKey];

  let recognition = null;
  let activeTimer = null;

  /* =========================
     MAIN CONTAINER
  ========================= */

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.bottom = "140px"; // ABOVE other floating buttons
  container.style.right = "20px";
  container.style.width = "450px";
  container.style.background = "#111";
  container.style.color = "#fff";
  container.style.borderRadius = "12px";
  container.style.boxShadow = "0 10px 30px rgba(0,0,0,0.4)";
  container.style.zIndex = "9999";
  container.style.fontFamily = "Arial, sans-serif";
  container.style.display = "none";
  container.style.overflow = "hidden";

  document.body.appendChild(container);

  /* =========================
     HEADER
  ========================= */

  const header = document.createElement("div");
  header.innerText = "🔥 Close Machine";
  header.style.padding = "14px";
  header.style.background = "#009f8d";
  header.style.cursor = "move";
  header.style.fontWeight = "bold";
  header.style.userSelect = "none";
  container.appendChild(header);

  /* =========================
     TAB NAV
  ========================= */

  const tabs = document.createElement("div");
  tabs.style.display = "flex";
  tabs.style.background = "#1a1a1a";
  container.appendChild(tabs);

  const content = document.createElement("div");
  content.style.padding = "16px";
  content.style.maxHeight = "420px";
  content.style.overflowY = "auto";
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
     OBJECTION TAB
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

    const detailedScript = `
Rapid Fire Qualification Script:

1. "What is your total unsecured debt amount?"
   (Credit cards, personal loans, lines of credit — no car, no mortgage)

2. "Are you currently working or receiving steady income?"

3. "If we restructure this properly, could you commit to at least $250 per month?"

4. "Are you looking to handle this immediately, or are you just exploring?"

Stay direct. No fluff. Control the frame.
`;

    const scriptBlock = document.createElement("p");
    scriptBlock.innerText = detailedScript;
    scriptBlock.style.whiteSpace = "pre-wrap";
    scriptBlock.style.marginTop = "15px";
    content.appendChild(scriptBlock);

    content.appendChild(createCopyButton(detailedScript));
  }

  /* =========================
     ABOUT TAB
  ========================= */

  function renderAbout() {
    content.innerHTML = "";

    const aboutText = `
What Is Close Machine?

This is a live tactical assistant built to help you control calls, eliminate hesitation, and move prospects to decisions.

Why We Use It:

• Keeps you structured under pressure
• Prevents rambling
• Ensures compliance
• Forces proper qualification
• Protects conversion windows
• Helps you overcome objections instantly

How To Use It:

1. Follow stages.
2. Use rapid qualifiers under time pressure.
3. Lock structure before emotion.
4. Control pace.
5. Close confidently.

This tool is not for reading scripts.
It is for executing controlled persuasion.
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
     TOGGLE BUTTON
  ========================= */

  const toggle = document.createElement("div");
  toggle.innerText = "Close Machine";
  toggle.style.position = "fixed";
  toggle.style.bottom = "90px"; // ABOVE your other buttons
  toggle.style.right = "20px";
  toggle.style.background = "#009f8d";
  toggle.style.padding = "12px 18px";
  toggle.style.borderRadius = "30px";
  toggle.style.cursor = "pointer";
  toggle.style.zIndex = "9999";
  toggle.onclick = () => {
    container.style.display =
      container.style.display === "none" ? "block" : "none";
  };

  document.body.appendChild(toggle);

  /* =========================
     DRAG LOGIC
  ========================= */

  let isDragging = false;
  let offsetX, offsetY;

  header.addEventListener("mousedown", function (e) {
    isDragging = true;
    offsetX = e.clientX - container.offsetLeft;
    offsetY = e.clientY - container.offsetTop;
  });

  document.addEventListener("mousemove", function (e) {
    if (isDragging) {
      container.style.left = (e.clientX - offsetX) + "px";
      container.style.top = (e.clientY - offsetY) + "px";
      container.style.right = "auto";
      container.style.bottom = "auto";
    }
  });

  document.addEventListener("mouseup", function () {
    isDragging = false;
  });

});
