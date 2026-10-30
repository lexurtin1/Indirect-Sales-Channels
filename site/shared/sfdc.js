(function () {
  const alertEl = document.getElementById("alert");
  const list = document.getElementById("timeline");
  const motion = window.iscMotionOk ? window.iscMotionOk() : true;

  function show() {
    alertEl.classList.add("is-in");
  }

  if (motion) setTimeout(show, 700);
  else show();

  fetch("/data/ffi/extracted/ffi.json")
    .then((response) => response.json())
    .then((ffi) => {
      const month = "2026-09";
      const head = ffi.headlines[month];
      const row = ffi.asset_classes.monthly[month];
      const source = ffi.sources.find((item) => item.id === head.source);
      document.getElementById("alert-title").textContent = "Fund flow alert · September 2026";
      document.getElementById("alert-body").textContent =
        "UK investors, published Fund Flow Index. Equities " + row.equities.toLocaleString("en-GB") +
        " GBP m. " + head.headline;
      document.getElementById("alert-source").textContent = "Source: " + source.title + ". Published badge. This is not illustrative network volume.";
    })
    .catch(() => {
      document.getElementById("alert-body").textContent = "The published Fund Flow Index file did not load.";
    });

  document.getElementById("create-task").addEventListener("click", () => {
    const item = document.createElement("li");
    item.innerHTML = "<strong>Task created.</strong> Follow up on the September Fund Flow Index alert for Northwind Asset Management.";
    list.prepend(item);
    alertEl.hidden = true;
  });
})();
