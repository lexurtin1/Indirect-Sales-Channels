(function () {
  const VARIANTS = {
    "1a": { theme: "light", pov: "38,4,1.75", label: "1a Light" },
    "1b": { theme: "ink", pov: "38,4,1.75", label: "1b Black" },
    "1c": { theme: "light", pov: "26,8,1.2", label: "1c Horizon" }
  };

  const ASSET = ["equity", "fixed income", "money market", "mixed assets", "ETF"];
  const SECTOR = ["technology", "healthcare", "financials", "industrials", "global income"];
  const PERIOD = ["this week", "this month", "Q3 2025", "the last 30 days", "year to date"];

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
    cardStep: "intro",
    market: null,
    copied: false
  };

  const $ = (id) => document.getElementById(id);
  const motionOk = () =>
    window.iscMotionOk ? window.iscMotionOk() : !matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const adj = (name) => {
    const map = {
      "United Kingdom": "UK",
      "United States": "US",
      "Czech Republic": "Czech",
      "South Africa": "South African",
      "New Zealand": "New Zealand",
      "Hong Kong": "Hong Kong",
      "Isle of Man": "Isle of Man",
      "United Arab Emirates": "UAE",
      "Cayman Islands": "Cayman",
      "Brunei Darussalam": "Brunei"
    };
    if (map[name]) return map[name];
    if (name.endsWith("y")) return name.slice(0, -1) + "ian";
    if (name.endsWith("land")) return name + "ic";
    if (name.endsWith("a")) return name + "n";
    return name;
  };

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

  function pct(min, max) {
    const v = min + Math.random() * (max - min);
    const sign = v >= 0 ? "+" : "";
    return sign + v.toFixed(1) + "%";
  }

  function brandHead() {
    return (
      '<div class="mcp-brand">' +
      '<img src="/assets/brand/calastone-wordmark-black.png" alt="Calastone">' +
      "<em>MCP</em>" +
      "</div>"
    );
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
    if (pushHash !== false) history.replaceState(null, "", "#" + v);
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

  function buildInsight(arc) {
    const from = adj(arc.from);
    const to = adj(arc.to);
    const asset = pick(ASSET);
    const sector = pick(SECTOR);
    const period = pick(PERIOD);
    const vol = Math.max(1, Math.round((arc.orders / 105120) * (0.6 + Math.random() * 0.8)));
    const templates = [
      {
        kind: "Flow surge",
        text: from + " distributors into " + to + " " + asset + " funds " + pct(4, 28) + " " + period,
        metric: pct(4, 28)
      },
      {
        kind: "Net inflow",
        text: to + " " + asset + " books saw " + fmt(vol * 1200) + " from " + from + " platforms " + period,
        metric: fmt(vol * 1200)
      },
      {
        kind: "Corridor share",
        text: from + " → " + to + " now " + (1.2 + Math.random() * 6).toFixed(1) + "% of cross-border " + asset,
        metric: (1.2 + Math.random() * 6).toFixed(1) + "%"
      },
      {
        kind: "STP rate",
        text: from + " to " + to + " straight-through processing at " + (88 + Math.random() * 11).toFixed(1) + "%",
        metric: (88 + Math.random() * 11).toFixed(1) + "%"
      },
      {
        kind: "Manual drop",
        text: "Manual " + asset + " orders " + from + " → " + to + " down " + pct(-22, -3).replace("+", ""),
        metric: pct(-22, -3)
      },
      {
        kind: "New ISINs",
        text: (2 + Math.floor(Math.random() * 9)) + " new " + to + " " + asset + " ISINs opened to " + from + " distributors",
        metric: String(2 + Math.floor(Math.random() * 9))
      },
      {
        kind: "Coverage gap",
        text: (3 + Math.floor(Math.random() * 12)) + " " + from + " distributors not yet trading your " + to + " range",
        metric: String(3 + Math.floor(Math.random() * 12))
      },
      {
        kind: "Sector tilt",
        text: from + " " + sector + " " + asset + " into " + to + " " + pct(-12, 34) + " vs prior month",
        metric: pct(-12, 34)
      },
      {
        kind: "Settlement",
        text: to + " settlement breaks on " + from + " tickets " + pct(-18, -2).replace("+", "") + " " + period,
        metric: pct(-18, -2)
      },
      {
        kind: "MMF spike",
        text: from + " corporate treasurers into " + to + " money market funds " + pct(6, 41) + " " + period,
        metric: pct(6, 41)
      },
      {
        kind: "ETF creation",
        text: to + " ETF creations from " + from + " wealth platforms up " + pct(3, 19).replace("+", ""),
        metric: pct(3, 19)
      },
      {
        kind: "Order latency",
        text: "Median " + from + " → " + to + " order time now " + (0.4 + Math.random() * 2.2).toFixed(1) + "s",
        metric: (0.4 + Math.random() * 2.2).toFixed(1) + "s"
      },
      {
        kind: "Rank change",
        text: from + " climbs to #" + (1 + Math.floor(Math.random() * 8)) + " source market for " + to + " " + asset,
        metric: "#" + (1 + Math.floor(Math.random() * 8))
      },
      {
        kind: "Tokenised cut",
        text: "Tokenised " + asset + " share class interest from " + from + " into " + to + " + " + (1 + Math.floor(Math.random() * 5)) + " enquiries",
        metric: "+" + (1 + Math.floor(Math.random() * 5))
      },
      {
        kind: "Volume pulse",
        text: fmt(vol) + " live " + asset + " orders " + from + " distributors → " + to + " managers",
        metric: fmt(vol)
      }
    ];
    const row = pick(templates);
    return { kind: row.kind, text: row.text, metric: row.metric, arc: arc };
  }

  function renderSide() {
    const panel = $("side-panel");
    if (!panel) return;
    const limit = state.variant === "1c" ? 3 : 4;
    const ticks = state.ticks.slice(0, limit);
    panel.innerHTML =
      '<div class="ticker" id="ticker">' +
      '<div class="ticker-head"><span class="dot" aria-hidden="true"></span>' +
      "<span>Signals · live</span></div>" +
      ticks
        .map(
          (t) =>
            '<div class="tick-row">' +
            '<div class="tick-kind">' +
            esc(t.kind) +
            "</div>" +
            '<div class="tick-text">' +
            esc(t.text) +
            "</div>" +
            '<div class="tick-metric">' +
            esc(t.metric) +
            "</div>" +
            "</div>"
        )
        .join("") +
      "</div>";
  }

  function renderCard() {
    const card = $("mcp-card");
    if (!card) return;
    card.classList.toggle("is-prompt", state.cardStep === "prompt");
    card.classList.toggle("is-done", state.cardStep === "done");

    if (state.cardStep === "intro") {
      card.innerHTML =
        brandHead() +
        '<p class="mcp-kicker">For your AI assistant</p>' +
        "<h1>Ask Calastone data in plain language.</h1>" +
        '<p class="lede">Install once. Query orders, flows, ISINs and market coverage with your firm\'s entitlements.</p>' +
        '<ul class="cap-chips">' +
        "<li>Orders &amp; flows</li>" +
        "<li>Custom reports</li>" +
        "<li>ISIN checks</li>" +
        "<li>Coverage gaps</li>" +
        "</ul>" +
        '<button type="button" class="btn btn-teal hotspot" id="card-download">Download MCP</button>' +
        '<span class="fine">Read-only · scoped to your entitlements</span>';
      $("card-download").addEventListener("click", () => finishDownload());
      return;
    }

    if (state.cardStep === "prompt") {
      const market = state.market || "this market";
      card.innerHTML =
        brandHead() +
        '<p class="mcp-kicker">Country selected</p>' +
        "<h1>Open " +
        esc(market) +
        " in your AI.</h1>" +
        '<p class="lede">Download the Calastone MCP to query distributors, corridors and fund flows for ' +
        esc(market) +
        ".</p>" +
        '<div class="prompt-examples">' +
        "<span>Order volume by " +
        esc(market) +
        " distributor, Q3 2025</span>" +
        "<span>Net flows into and out of " +
        esc(market) +
        ", by month</span>" +
        "<span>Counterparties in " +
        esc(market) +
        " not trading our funds</span>" +
        "</div>" +
        '<button type="button" class="btn btn-teal hotspot" id="card-download">Download MCP</button>' +
        '<button type="button" class="back" id="card-dismiss">Keep exploring</button>';
      $("card-download").addEventListener("click", () => finishDownload());
      $("card-dismiss").addEventListener("click", () => {
        state.cardStep = "intro";
        state.market = null;
        renderCard();
      });
      return;
    }

    const prompt = state.market
      ? "order volume by distributor in " + state.market + ", Q3 2025."
      : "net flows by distributor, last month.";
    card.innerHTML =
      brandHead() +
      '<p class="mcp-kicker done">Downloaded</p>' +
      "<h1>Add the server to your client.</h1>" +
      '<div class="setup">' +
      "<span>1. Open your client's MCP settings.</span>" +
      "<span>2. Paste the config below.</span>" +
      "<span>3. Sign in with Calastone credentials.</span>" +
      "</div>" +
      "<pre>\"calastone\": {\n  \"command\": \"calastone-mcp\"\n}</pre>" +
      '<button type="button" class="btn btn-teal btn-sm" id="card-copy">' +
      (state.copied ? "Copied" : "Copy config") +
      "</button>" +
      '<span class="fine">Try: ' +
      esc(prompt) +
      "</span>" +
      '<button type="button" class="back" id="card-again">Download again</button>';
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
      } else done();
    });
    $("card-again").addEventListener("click", () => finishDownload());
  }

  function finishDownload() {
    state.cardStep = "done";
    state.copied = false;
    renderCard();
    const card = $("mcp-card");
    if (card) card.scrollIntoView({ block: "nearest", behavior: motionOk() ? "smooth" : "auto" });
  }

  function openDownload(market) {
    if (market) state.market = market;
    finishDownload();
  }

  function promptCountry(market) {
    state.market = market;
    state.cardStep = "prompt";
    renderCard();
    const card = $("mcp-card");
    if (card) {
      card.classList.add("pulse-once");
      setTimeout(() => card.classList.remove("pulse-once"), 900);
    }
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
        c.rows.map((r) => "<div>" + esc(r.k) + "<span>" + esc(r.v) + "</span></div>").join("") +
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
    const insight = buildInsight(arcs[i]);
    window.dispatchEvent(new CustomEvent("flowglobe:pulse", { detail: { arc: arcs[i] } }));
    state.ticks = [insight, ...state.ticks].slice(0, 5);
    renderSide();
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

    $("cap-download").addEventListener("click", () => {
      state.market = state.market;
      finishDownload();
    });

    window.addEventListener("flowglobe:select", (e) => {
      if (!e.detail || !e.detail.node) return;
      promptCountry(e.detail.node.name);
    });

    window.addEventListener("hashchange", () => setVariant(parseHash(), false));
  }

  function reset() {
    state.arcs = "all";
    state.spin = "on";
    state.ticks = [];
    state.cardStep = "intro";
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
        setTimeout(loop, 2200);
      };
      setTimeout(loop, 2200);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
