document.addEventListener("DOMContentLoaded", function () {

  const data = window.SCRIPTING_AND_LEAD_HANDLING;
  if (!data) return;

  // Create floating button
  const button = document.createElement("div");
  button.innerText = "🧠 Closing Machine";
  button.style.position = "fixed";
  button.style.bottom = "20px";
  button.style.right = "20px";
  button.style.background = "#009f8d";
  button.style.color = "#fff";
  button.style.padding = "12px 16px";
  button.style.borderRadius = "8px";
  button.style.cursor = "pointer";
  button.style.zIndex = "9999";
  button.style.fontWeight = "bold";
  button.style.boxShadow = "0 4px 10px rgba(0,0,0,0.3)";
  document.body.appendChild(button);

  // Create panel
  const panel = document.createElement("div");
  panel.style.position = "fixed";
  panel.style.bottom = "80px";
  panel.style.right = "20px";
  panel.style.width = "400px";
  panel.style.maxHeight = "70vh";
  panel.style.overflowY = "auto";
  panel.style.background = "#fff";
  panel.style.border = "1px solid #ccc";
  panel.style.borderRadius = "10px";
  panel.style.padding = "16px";
  panel.style.display = "none";
  panel.style.zIndex = "9999";
  panel.style.boxShadow = "0 6px 20px rgba(0,0,0,0.2)";
  document.body.appendChild(panel);

  function renderScripts() {
    panel.innerHTML = "";

    const sections = [
      { title: "Warm Transfer", obj: data.warmTransfer },
      { title: "Lead Transitions", obj: data.leadTransitions },
      { title: "Program Scripts", obj: data.programScripts },
      { title: "Objections", obj: data.objections }
    ];

    sections.forEach(section => {
      const header = document.createElement("h3");
      header.innerText = section.title;
      header.style.marginTop = "15px";
      panel.appendChild(header);

      Object.values(section.obj).forEach(item => {
        const box = document.createElement("div");
        box.style.background = "#f5f5f5";
        box.style.padding = "10px";
        box.style.marginBottom = "10px";
        box.style.borderRadius = "6px";

        const title = document.createElement("strong");
        title.innerText = item.title || item.name;
        box.appendChild(title);

        const script = document.createElement("p");
        script.innerText = item.script;
        script.style.whiteSpace = "pre-wrap";
        script.style.marginTop = "6px";
        box.appendChild(script);

        panel.appendChild(box);
      });
    });
  }

  renderScripts();

  button.addEventListener("click", function () {
    panel.style.display = panel.style.display === "none" ? "block" : "none";
  });

});
