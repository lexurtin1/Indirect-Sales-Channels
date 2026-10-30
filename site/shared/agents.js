(function () {
  const nodes = {
    sender: document.getElementById("sender"),
    router: document.getElementById("router"),
    receiver: document.getElementById("receiver")
  };
  const checks = Array.from(document.querySelectorAll("[data-check]"));
  const audit = document.getElementById("audit");
  const note = document.getElementById("direct-note");
  const afterBtn = document.getElementById("mode-after");
  const beforeBtn = document.getElementById("mode-before");
  let timer = null;
  let mode = "after";

  const afterLog = [
    "09:14:01 Northwind agent sent an order message.",
    "09:14:02 Identity confirmed for the Northwind agent.",
    "09:14:02 Permission granted for an order message to Harbour Platform.",
    "09:14:03 Message delivered. Audit log written."
  ];

  function clearTimers() {
    if (timer) {
      timer.forEach((id) => clearTimeout(id));
      timer = null;
    }
  }

  function resetVisual() {
    clearTimers();
    Object.keys(nodes).forEach((key) => nodes[key].classList.remove("is-hot"));
    checks.forEach((item) => item.classList.remove("is-on"));
    audit.innerHTML = "";
    nodes.router.classList.toggle("is-off", mode === "before");
  }

  function finishAfter() {
    nodes.sender.classList.add("is-hot");
    nodes.router.classList.remove("is-off");
    nodes.router.classList.add("is-hot");
    nodes.receiver.classList.add("is-hot");
    checks.forEach((item) => item.classList.add("is-on"));
    audit.innerHTML = afterLog.map((line) => "<li>" + line + "</li>").join("");
    note.textContent = "The message passed through Calastone. Identity, permission and the audit log are on.";
  }

  function finishBefore() {
    nodes.sender.classList.add("is-hot");
    nodes.receiver.classList.add("is-hot");
    nodes.router.classList.add("is-off");
    note.textContent = "The agents messaged each other directly. No identity check, no permission check, no audit log.";
    audit.innerHTML = "<li>No audit log.</li>";
  }

  function play() {
    resetVisual();
    const motion = window.iscMotionOk ? window.iscMotionOk() : true;
    if (!motion) {
      if (mode === "after") finishAfter();
      else finishBefore();
      return;
    }
    if (mode === "before") {
      timer = [
        setTimeout(() => nodes.sender.classList.add("is-hot"), 200),
        setTimeout(() => nodes.receiver.classList.add("is-hot"), 700),
        setTimeout(() => {
          note.textContent = "The agents messaged each other directly. No identity check, no permission check, no audit log.";
          audit.innerHTML = "<li>No audit log.</li>";
        }, 1100)
      ];
      return;
    }
    const steps = [
      () => nodes.sender.classList.add("is-hot"),
      () => {
        nodes.router.classList.remove("is-off");
        nodes.router.classList.add("is-hot");
        checks[0].classList.add("is-on");
        audit.innerHTML = "<li>" + afterLog[0] + "</li><li>" + afterLog[1] + "</li>";
      },
      () => {
        checks[1].classList.add("is-on");
        audit.innerHTML += "<li>" + afterLog[2] + "</li>";
      },
      () => {
        nodes.receiver.classList.add("is-hot");
        checks[2].classList.add("is-on");
        audit.innerHTML += "<li>" + afterLog[3] + "</li>";
        note.textContent = "The message passed through Calastone. Identity, permission and the audit log are on.";
      }
    ];
    timer = steps.map((step, index) => setTimeout(step, 400 + index * 700));
  }

  function setMode(next) {
    mode = next;
    afterBtn.setAttribute("aria-pressed", next === "after" ? "true" : "false");
    beforeBtn.setAttribute("aria-pressed", next === "before" ? "true" : "false");
    play();
  }

  afterBtn.addEventListener("click", () => setMode("after"));
  beforeBtn.addEventListener("click", () => setMode("before"));
  window.iscReset = () => setMode(mode);
  setMode("after");
})();
