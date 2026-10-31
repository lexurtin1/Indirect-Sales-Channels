(function () {
  const VARIANTS = {
    "1a": { theme: "light", pov: "38,4,1.75", label: "1a Light" },
    "1b": { theme: "ink", pov: "38,4,1.75", label: "1b Black" },
    "1c": { theme: "light", pov: "26,8,1.2", label: "1c Horizon" }
  };

  const CAPS = [
    {
      num: "01",
      title: "Query data",
      prompt: "Net flows from Spanish distributors into our Luxembourg funds, by month, 2025.",
      rows: [
        { k: "Jul 2025", v: "+182.4k" },
        { k: "Aug 2025", v: "+141.0k" },
        { k: "Sep 2025", v: "−36.7k" }
      ]
    },
    {
      num: "02",
      title: "Custom reports",
      prompt: "Quarterly order volume by distributor, top 10, as a spreadsheet.",
      rows: [
        { k: "Rows", v: "10" },
        { k: "Period", v: "Q3 2025" },
        { k: "Format", v: ".xlsx" }
      ]
    },
    {
      num: "03",
      title: "ISIN checks",
      prompt: "Is LU0000000000 set up for routing to Taiwanese distributors?",
      rows: [
        { k: "Status", v: "Set up" },
        { k: "Routing paths", v: "3" },
        { k: "Last order", v: "2 days ago" }
      ]
    },
    {
      num: "04",
      title: "Market coverage",
      prompt: "Hong Kong distributors on the network not currently trading our funds.",
      rows: [
        { k: "On network", v: "18" },
        { k: "Not trading", v: "6" },
        { k: "Related service", v: "Order routing" }
      ]
    }
  ];

  const state = {
    variant: "1a",
    arcs: "all",
    spin: "on",
    ticks: [],
    sel: null,
    cardStep: "intro",
    email: "",
    market: null,
    copied: false
  };

  const $ = (id) => document.getElementById(id);
  const motionOk = () =>
    window.iscMotionOk ? window.iscMotionOk() : !matchMedia("(prefers-reduced-motion: reduce)").matches;

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function fmt(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "m";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "k";
    return String(Math.round(n));
  }

  function parseHash() {
    const h = (location.hash || "").replace(/^#/, "").toLowerCase();
    return VARIANTS[h] ? h : "1a";
  }

  function setVariant(v, pushHash) {
    if (!VARIANTS[v]) return;
    state.variant = v;
    document.body.dataset.variant = v;
    document.querySelectorAll(".variant-switch button").forEach((btn) => {
      btn.setAttribute("aria-pressed", btn.dataset.variant === v ? "true" : "false");
    });
    const sub = $("stat-sub");
    if (sub) {
      sub.textContent =
        v === "1c"
          ? "51 countries · 321 corridors"
          : "51 countries · 321 corridors · 109.8m cross-border";
    }
    if (pushHash !== false) {
      history.replaceState(null, "", "#" + v);
    }
    mountGlobe();
    renderSide();
  }

  function mountGlobe() {
    const host = $("globe-host");
    if (!host) return;
    const conf = VARIANTS[state.variant];
    host.innerHTML = "";
    const el = document.createElement("flow-globe");
    el.id = "flow-globe";
    el.setAttribute("theme", conf.theme);
    el.setAttribute("pov", conf.pov);
    el.setAttribute("arcs", state.arcs);
    el.setAttribute("spin", state.spin);
    host.appendChild(el);
  }

  function applyGlobeAttrs() {
    const el = $("flow-globe");
    if (!el) return;
    el.setAttribute("arcs", state.arcs);
    el.setAttribute("spin", state.spin);
  }

  function selView(d) {
    if (!d) return null;
    const n = d.node;
    const rows = [
      ...d.out.map((a) => ({ route: "To " + a.to, n: fmt(a.orders), o: a.orders })),
      ...d.inn.map((a) => ({ route: "From " + a.from, n: fmt(a.orders), o: a.orders }))
    ]
      .sort((x, y) => y.o - x.o)
      .slice(0, 4);
    return {
      name: n.name,
      total: fmt(n.total),
      rows: rows,
      prompts: [
        "Order volume from " + n.name + " distributors, by fund, 2025",
        "Net flows into and out of " + n.name + ", by month",
        "Counterparties in " + n.name + " not currently trading our funds"
      ]
    };
  }

  function renderSide() {
    const panel = $("side-panel");
    if (!panel) return;
    const sel = selView(state.sel);
    if (sel) {
      panel.innerHTML =
        '<div class="market-panel" id="market-panel">' +
        '<div class="head"><span class="label">Market · 2025</span>' +
        '<button type="button" class="close" id="close-market" aria-label="Close">×</button></div>' +
        '<div class="name">' + esc(sel.name) + "</div>" +
        '<div class="total">' + esc(sel.total) + " orders placed and received</div>" +
        '<div class="rows">' +
        sel.rows
          .map(
            (r) =>
              "<div>" + esc(r.route) + "<span>" + esc(r.n) + "</span></div>"
          )
          .join("") +
        "</div>" +
        '<div class="prompts-label">Example MCP queries</div>' +
        sel.prompts.map((p) => '<div class="prompt">' + esc(p) + "</div>").join("") +
        '<button type="button" class="btn btn-ink btn-sm" id="market-download">Download MCP</button>' +
        "</div>";
      $("close-market").addEventListener("click", () => {
        state.sel = null;
        renderSide();
      });
      $("market-download").addEventListener("click", () => openDownload(sel.name));
      return;
    }

    const limit = state.variant === "1c" ? 3 : 5;
    const ticks = state.ticks.slice(0, limit);
    panel.innerHTML =
      '<div class="ticker" id="ticker">' +
      '<div class="ticker-head"><span class="dot" aria-hidden="true"></span>' +
      "<span>Orders routed · live</span></div>" +
      ticks
        .map(
          (t) =>
            '<div class="tick-row"><div class="route">' +
            esc(t.from) +
            " → " +
            esc(t.to) +
            '</div><span class="n">' +
            esc(t.n) +
            "</span></div>"
        )
        .join("") +
      "</div>";
  }

  function emailValid() {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(state.email);
  }

  function renderCard() {
    const card = $("mcp-card");
    if (!card) return;
    if (state.cardStep === "intro") {
      card.innerHTML =
        '<span class="eyebrow">Calastone MCP</span>' +
        "<div>" +
        "<h1>Connect your AI assistant to your Calastone data.</h1>" +
        '<p class="lede">An MCP server that lets any MCP-compatible assistant read your firm\'s Calastone data.</p>' +
        "</div>" +
        '<div class="cap-list">' +
        "<span>Query orders and flows</span>" +
        "<span>Create custom reports</span>" +
        "<span>Review ISIN checks</span>" +
        "<span>Review market coverage</span>" +
        "</div>" +
        '<button type="button" class="btn btn-ink hotspot" id="card-download">Download</button>' +
        '<span class="fine">Read-only · scoped to your entitlements</span>';
      $("card-download").addEventListener("click", () => {
        state.cardStep = "email";
        renderCard();
      });
      return;
    }

    if (state.cardStep === "email") {
      card.innerHTML =
        '<button type="button" class="back" id="card-back">← Back</button>' +
        '<span class="eyebrow">Step 1 of 2</span>' +
        '<p class="lede">Enter your work email. It is used to link the MCP to your firm\'s entitlements.</p>' +
        '<label>Work email' +
        '<input type="email" id="card-email" placeholder="name@yourfirm.com" value="' +
        esc(state.email) +
        '" autocomplete="email">' +
        '<span class="hint" id="card-hint"></span>' +
        "</label>" +
        '<button type="button" class="btn btn-ink" id="card-submit">Download</button>';
      const hint = $("card-hint");
      hint.textContent = state.market
        ? "Market selected: " + state.market
        : "Business address required";
      const input = $("card-email");
      const submit = $("card-submit");
      submit.disabled = !emailValid();
      input.addEventListener("input", () => {
        state.email = input.value;
        submit.disabled = !emailValid();
      });
      $("card-back").addEventListener("click", () => {
        state.cardStep = "intro";
        renderCard();
      });
      submit.addEventListener("click", () => {
        if (!emailValid()) return;
        state.cardStep = "done";
        state.copied = false;
        renderCard();
      });
      input.focus();
      return;
    }

    const prompt = state.market
      ? "order volume by distributor in " + state.market + ", Q3 2025."
      : "net flows by distributor, last month.";
    card.innerHTML =
      '<span class="eyebrow done">Step 2 of 2 · Downloaded</span>' +
      '<div class="setup">' +
      "<span>1. Open your client's MCP settings.</span>" +
      "<span>2. Add the server config below.</span>" +
      "<span>3. Sign in with Calastone credentials.</span>" +
      "</div>" +
      "<pre>\"calastone\": {\n  \"command\": \"calastone-mcp\"\n}</pre>" +
      '<button type="button" class="btn btn-secondary btn-sm" id="card-copy">' +
      (state.copied ? "Copied" : "Copy config") +
      "</button>" +
      '<span class="fine">Example query: ' +
      esc(prompt) +
      "</span>";
    $("card-copy").addEventListener("click", () => {
      const text = '"calastone": {\n  "command": "calastone-mcp"\n}';
      const done = () => {
        state.copied = true;
        renderCard();
        setTimeout(() => {
          state.copied = false;
          if (state.cardStep === "done") renderCard();
        }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(done);
      } else {
        done();
      }
    });
  }

  function openDownload(market) {
    state.market = market || null;
    state.cardStep = "email";
    renderCard();
    const card = $("mcp-card");
    if (card) card.scrollIntoView({ block: "nearest", behavior: motionOk() ? "smooth" : "auto" });
  }

  function renderControls() {
    const arcsAll = $("arcs-all");
    const arcsMajor = $("arcs-major");
    const spinBtn = $("spin-toggle");
    if (!arcsAll || !arcsMajor || !spinBtn) return;
    arcsAll.setAttribute("aria-pressed", state.arcs === "all" ? "true" : "false");
    arcsMajor.setAttribute("aria-pressed", state.arcs === "major" ? "true" : "false");
    spinBtn.textContent = state.spin === "on" ? "Pause spin" : "Resume spin";
  }

  function renderStat(value) {
    const el = $("stat-value");
    if (el) el.textContent = fmt(value);
  }

  function renderCapabilities() {
    const grid = $("cap-grid");
    if (!grid) return;
    grid.innerHTML = CAPS.map(
      (c) =>
        '<article class="cap-tile">' +
        '<span class="num">' +
        esc(c.num) +
        "</span>" +
        '<div class="title">' +
        esc(c.title) +
        "</div>" +
        '<div class="prompt">' +
        esc(c.prompt) +
        "</div>" +
        '<div class="rows">' +
        c.rows
          .map((r) => "<div>" + esc(r.k) + "<span>" + esc(r.v) + "</span></div>")
          .join("") +
        "</div></article>"
    ).join("");
  }

  function pushTick() {
    const arcs = window.CALASTONE_FLOWS && window.CALASTONE_FLOWS.arcs;
    if (!arcs || !arcs.length) return;
    if (!pushTick._w) {
      pushTick._w = arcs.map((a) => Math.sqrt(a.orders));
      pushTick._wt = pushTick._w.reduce((x, y) => x + y, 0);
    }
    let r = Math.random() * pushTick._wt;
    let i = 0;
    while (i < arcs.length - 1 && r > pushTick._w[i]) {
      r -= pushTick._w[i];
      i++;
    }
    const a = arcs[i];
    const n = Math.max(1, Math.round((a.orders / 105120) * (0.6 + Math.random() * 0.8)));
    window.dispatchEvent(new CustomEvent("flowglobe:pulse", { detail: { arc: a } }));
    state.ticks = [{ from: a.from, to: a.to, n: n.toLocaleString("en-GB") }, ...state.ticks].slice(0, 5);
    if (!state.sel) renderSide();
  }

  function startStat() {
    const target = (window.CALASTONE_FLOWS && window.CALASTONE_FLOWS.meta.liveTotal) || 273276093;
    if (!motionOk()) {
      renderStat(target);
      return;
    }
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / 1600);
      const e = 1 - Math.pow(1 - p, 3);
      renderStat(target * e);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function wire() {
    document.querySelectorAll(".variant-switch button").forEach((btn) => {
      btn.addEventListener("click", () => setVariant(btn.dataset.variant));
    });

    $("arcs-all").addEventListener("click", () => {
      state.arcs = "all";
      renderControls();
      applyGlobeAttrs();
    });
    $("arcs-major").addEventListener("click", () => {
      state.arcs = "major";
      renderControls();
      applyGlobeAttrs();
    });
    $("spin-toggle").addEventListener("click", () => {
      state.spin = state.spin === "on" ? "off" : "on";
      renderControls();
      applyGlobeAttrs();
    });

    $("cap-download").addEventListener("click", () => openDownload(state.market));

    window.addEventListener("flowglobe:select", (e) => {
      if (!e.detail) return;
      state.sel = e.detail;
      renderSide();
    });

    window.addEventListener("hashchange", () => setVariant(parseHash(), false));
  }

  function reset() {
    state.arcs = "all";
    state.spin = "on";
    state.ticks = [];
    state.sel = null;
    state.cardStep = "intro";
    state.email = "";
    state.market = null;
    state.copied = false;
    renderControls();
    renderCard();
    mountGlobe();
    for (let i = 0; i < 4; i++) pushTick();
    renderSide();
    startStat();
  }

  window.iscReset = reset;

  function waitFlows(cb) {
    if (window.CALASTONE_FLOWS) cb();
    else setTimeout(() => waitFlows(cb), 50);
  }

  function init() {
    renderCapabilities();
    wire();
    setVariant(parseHash(), true);
    renderControls();
    renderCard();
    waitFlows(() => {
      startStat();
      for (let i = 0; i < 4; i++) pushTick();
      renderSide();
      const loop = () => {
        pushTick();
        setTimeout(loop, 1800);
      };
      setTimeout(loop, 1800);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
