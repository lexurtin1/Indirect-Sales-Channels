(function () {
  const metaEl = document.getElementById("isc-meta");
  const meta = metaEl ? JSON.parse(metaEl.textContent) : {};
  const tour = Array.isArray(meta.tour) ? meta.tour : [];
  let step = 0;
  let open = false;

  const tools = document.createElement("div");
  tools.className = "isc-tools";

  if (!meta.hideAbout) {
    const about = document.createElement("button");
    about.type = "button";
    about.textContent = "What you're looking at";
    tools.appendChild(about);

    const panel = document.createElement("aside");
    panel.className = "isc-panel";
    panel.hidden = true;
    panel.innerHTML =
      "<h2>What you're looking at</h2>" +
      "<p><strong>Channel.</strong> " + esc(meta.channel || "Indirect sales channels") + "</p>" +
      "<p><strong>Simulated.</strong> " + esc(meta.simulated || "This screen is a simulation.") + "</p>" +
      "<p><strong>What would need building.</strong> " + esc(meta.build || "Not specified.") + "</p>";
    document.body.appendChild(panel);
    about.addEventListener("click", () => {
      panel.hidden = !panel.hidden;
    });
  }

  if (tour.length && !meta.hideTour) {
    const tourBtn = document.createElement("button");
    tourBtn.type = "button";
    tourBtn.textContent = "Guided tour";
    tourBtn.addEventListener("click", () => startTour(0));
    tools.appendChild(tourBtn);
  }

  const reset = document.createElement("button");
  reset.type = "button";
  reset.textContent = "Reset";
  reset.addEventListener("click", () => {
    if (typeof window.iscReset === "function") window.iscReset();
    else location.reload();
  });
  tools.appendChild(reset);

  if (!meta.front) {
    const back = document.createElement("a");
    back.href = "/";
    back.textContent = "Front page";
    tools.appendChild(back);
  }

  document.body.appendChild(tools);

  const card = document.createElement("div");
  card.className = "isc-tour";
  card.hidden = true;
  card.innerHTML =
    '<h2 id="isc-tour-title"></h2><p id="isc-tour-body"></p>' +
    '<div class="row"><span id="isc-tour-count"></span>' +
    '<button type="button" class="secondary" id="isc-tour-back">Back</button>' +
    '<button type="button" id="isc-tour-next">Next</button></div>';
  document.body.appendChild(card);

  card.querySelector("#isc-tour-back").addEventListener("click", () => {
    if (step === 0) stopTour();
    else showStep(step - 1);
  });
  card.querySelector("#isc-tour-next").addEventListener("click", () => {
    if (step >= tour.length - 1) stopTour();
    else showStep(step + 1);
  });

  function startTour(index) {
    open = true;
    card.hidden = false;
    showStep(index);
  }

  function showStep(index) {
    clearMark();
    step = index;
    const item = tour[index];
    card.querySelector("#isc-tour-title").textContent = item.title;
    card.querySelector("#isc-tour-body").textContent = item.body;
    card.querySelector("#isc-tour-count").textContent = (index + 1) + " of " + tour.length;
    card.querySelector("#isc-tour-next").textContent = index === tour.length - 1 ? "Done" : "Next";
    card.querySelector("#isc-tour-back").textContent = index === 0 ? "Close" : "Back";
    const el = item.selector ? document.querySelector(item.selector) : null;
    if (el) {
      el.classList.add("is-tour-target");
      el.scrollIntoView({ block: "center", behavior: motionOk() ? "smooth" : "auto" });
    }
  }

  function stopTour() {
    open = false;
    card.hidden = true;
    clearMark();
  }

  function clearMark() {
    document.querySelectorAll(".is-tour-target").forEach((el) => el.classList.remove("is-tour-target"));
  }

  function motionOk() {
    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function esc(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  window.iscMotionOk = motionOk;
})();
