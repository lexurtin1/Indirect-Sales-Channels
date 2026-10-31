(function () {
  const metaEl = document.getElementById("isc-meta");
  const meta = metaEl ? JSON.parse(metaEl.textContent) : {};

  const tools = document.createElement("div");
  tools.className = "isc-tools";

  const reset = document.createElement("button");
  reset.type = "button";
  reset.className = "isc-tool-btn";
  reset.setAttribute("aria-label", "Reset");
  reset.title = "Reset";
  reset.innerHTML =
    '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M3.5 12a8.5 8.5 0 1 0 2.1-5.6"/>' +
    '<path d="M3.5 4.5v4.2h4.2"/>' +
    "</svg>";
  reset.addEventListener("click", () => {
    if (typeof window.iscReset === "function") window.iscReset();
    else location.reload();
  });
  tools.appendChild(reset);

  if (!meta.front) {
    const back = document.createElement("a");
    back.href = "/";
    back.className = "isc-tool-btn";
    back.setAttribute("aria-label", "Front page");
    back.title = "Front page";
    back.innerHTML =
      '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M4 10.5 12 4l8 6.5"/>' +
      '<path d="M7 10v9h10v-9"/>' +
      '<path d="M10 19v-5h4v5"/>' +
      "</svg>";
    tools.appendChild(back);
  }

  document.body.appendChild(tools);

  function motionOk() {
    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  window.iscMotionOk = motionOk;
})();
