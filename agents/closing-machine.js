document.addEventListener("DOMContentLoaded", function () {

  const data = window.SCRIPTING_AND_LEAD_HANDLING;
  if (!data) return;

  const route = window.CURRENT_ROUTE || "LEVEL";
  const mappedProgramKey = data.helper.mapRouteToProgram(route);
  const programData = data.programScripts[mappedProgramKey];

  let callStage = "qualification";
  let recognition = null;

  /* =========================
     MAIN CONTAINER
  ========================= */

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.bottom = "100px";
  container.style.right = "20px";
  container.style.width = "420px";
  container.style.background = "#111";
  container.style.color = "#fff";
  container.style.borderRadius = "12px";
  container.style.boxShadow = "0 10px 30px rgba(0,0,0,0.4)";
  container.style.zIndex = "9999";
  container.style.fontFamily = "Arial, sans-serif";
  container.style.display = "none";
  container.style.resize = "both";
  container.style.overflow = "hidden";

  document.body.appendChild(container);

  /* =========================
     HEADER (DRAGGABLE)
  ========================= */

  const header = document.createElement("div");
  header.innerText = "🧠 AI Agent Assist";
  header.style.padding = "14px";
  header.style.background = "#009f8d";
  header.style.cursor = "move";
  header.style.fontWeight = "bold";
  header.style.userSelect = "none";
  container.appendChild(header);

  /* =========================
     STAGE TRACKING
  ========================= */

  const stageBar = document.createElement("div");
  stageBar.style.display = "flex";
  stageBar.style.background = "#1a1a1a";
  container.appendChild(stageBar);

  const stages = ["qualification", "program", "objection", "close"];

  stages.forEach(stage => {
    const btn = document.createElement("div");
    btn.innerText = stage.toUpperCase();
    btn.style.flex = "1";
    btn.style.padding = "8px";
    btn.style.cursor = "pointer";
    btn.style.textAlign = "center";
    btn.onclick = () => callStage = stage;
    stageBar.appendChild(btn);
  });

  /* =========================
     TAB NAVIGATION
  ========================= */

  const tabs = document.createElement("div");
  tabs.style.display = "flex";
  tabs.style.background = "#222";
  container.appendChild(tabs);

  const content = document.createElement("div");
  content.style.padding = "16px";
  content.style.maxHeight = "400px";
  content.style.overflowY = "auto";
  container.appendChild(content);

  const tabNames = ["Program", "Objections", "Warm Transfer"];

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

  function renderWarmTransfer() {
    content.innerHTML = "";
    Object.values(data.warmTransfer).forEach(item => {
      const box = document.createElement("div");
      box.style.marginBottom = "15px";
      box.style.padding = "10px";
      box.style.background = "#1f1f1f";
      box.style.borderRadius = "8px";

      const title = document.createElement("strong");
      title.innerText = item.title;
      box.appendChild(title);

      const script = document.createElement("p");
      script.innerText = item.script;
      script.style.whiteSpace = "pre-wrap";
      script.style.marginTop = "6px";
      box.appendChild(script);

      box.appendChild(createCopyButton(item.script));
      content.appendChild(box);
    });
  }

  const renderMap = {
    "Program": renderProgram,
    "Objections": renderObjections,
    "Warm Transfer": renderWarmTransfer
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
     REAL-TIME OBJECTION DETECTION
  ========================= */

  function detectObjection(text) {
    if (!text) return null;
    const lower = text.toLowerCase();

    for (const key in data.objections) {
      const obj = data.objections[key];
      if (!obj.triggers) continue;
      if (obj.triggers.some(t => lower.includes(t.toLowerCase()))) {
        return key;
      }
    }
    return null;
  }

  function highlightObjection(key) {
    if (!key) return;
    renderObjections();

    const boxes = content.querySelectorAll("div");
    boxes.forEach(box => {
      if (box.innerText.includes(data.objections[key].title)) {
        box.style.border = "2px solid #00ffcc";
        box.style.background = "#003333";
        box.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }

  /* =========================
     VOICE MODE
  ========================= */

  function startVoiceMode() {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) return;

    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = true;

    recognition.onresult = function (event) {
      const transcript = event.results[event.results.length - 1][0].transcript;
      const detected = detectObjection(transcript);
      if (detected) highlightObjection(detected);
    };

    recognition.start();
  }

  const voiceBtn = document.createElement("button");
  voiceBtn.innerText = "🎙 Voice Mode";
  voiceBtn.style.background = "#444";
  voiceBtn.style.color = "#fff";
  voiceBtn.style.border = "none";
  voiceBtn.style.padding = "8px";
  voiceBtn.style.margin = "8px";
  voiceBtn.onclick = startVoiceMode;
  container.appendChild(voiceBtn);

  /* =========================
     GPT DYNAMIC REBUTTAL HOOK
  ========================= */

  async function generateDynamicRebuttal(context) {
    const response = await fetch("/api/gpt-rebuttal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(context)
    });

    const result = await response.json();

    const aiBox = document.createElement("div");
    aiBox.style.marginTop = "15px";
    aiBox.style.padding = "10px";
    aiBox.style.background = "#002b2b";
    aiBox.style.borderRadius = "8px";
    aiBox.innerText = result.rebuttal;

    content.appendChild(aiBox);
  }

  /* =========================
     TOGGLE BUTTON
  ========================= */

  const toggle = document.createElement("div");
  toggle.innerText = "🧠";
  toggle.style.position = "fixed";
  toggle.style.bottom = "20px";
  toggle.style.right = "20px";
  toggle.style.background = "#009f8d";
  toggle.style.padding = "14px";
  toggle.style.borderRadius = "50%";
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
