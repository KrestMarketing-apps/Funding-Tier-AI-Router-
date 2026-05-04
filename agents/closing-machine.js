document.addEventListener("DOMContentLoaded", function () {

  const data = window.SCRIPTING_AND_LEAD_HANDLING;
  if (!data) return;

  const route = window.CURRENT_ROUTE || "LEVEL";
  const mappedProgramKey = data.helper.mapRouteToProgram(route);
  const programData = data.programScripts[mappedProgramKey];

  /* ========================
     CREATE MAIN CONTAINER
  ======================== */

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

  /* ========================
     HEADER (DRAGGABLE)
  ======================== */

  const header = document.createElement("div");
  header.innerText = "🧠 AI Agent Assist";
  header.style.padding = "14px";
  header.style.background = "#009f8d";
  header.style.cursor = "move";
  header.style.fontWeight = "bold";
  header.style.userSelect = "none";
  container.appendChild(header);

  /* ========================
     TAB NAV
  ======================== */

  const tabs = document.createElement("div");
  tabs.style.display = "flex";
  tabs.style.background = "#1a1a1a";
  container.appendChild(tabs);

  const tabNames = ["Program", "Objections", "Warm Transfer"];
  const content = document.createElement("div");
  content.style.padding = "16px";
  content.style.maxHeight = "400px";
  content.style.overflowY = "auto";
  container.appendChild(content);

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
      box.style.background = "#222";
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
      box.style.background = "#222";
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

  /* ========================
     TOGGLE BUTTON
  ======================== */

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

  /* ========================
     DRAG LOGIC
  ======================== */

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
