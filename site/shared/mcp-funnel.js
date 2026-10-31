(function () {
  const VARIANTS = {
    "1a": { theme: "light", pov: "38,4,1.75", label: "1a Light" },
    "1b": { theme: "ink", pov: "38,4,1.75", label: "1b Black" },
    "1c": { theme: "light", pov: "26,8,1.2", label: "1c Horizon" }
  };

  const ASSET = ["equity", "fixed income", "money market", "mixed assets", "ETF"];
  const PERIOD = ["this month", "Q3 2025", "year to date"];
  const TICK_MS = 5500;

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
      "Hong Kong": "Hong Kong",
      "United Arab Emirates": "UAE",
      "Cayman Islands": "Cayman",
      "Brunei Darussalam": "Brunei"
    };
    if (map[name]) return map[name];
    if (name.endsWith("y")) return name.slice(0, -1) + "ian";
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
    const period = pick(PERIOD);
    const templates = [
      {
        kind: "Flow",
        text: from + " " + asset + " into " + to + " funds " + pct(3, 18) + " " + period,
        metric: pct(3, 18)
      },
      {
        kind: "Share",
        text: from + " → " + to + " " + (1.1 + Math.random() * 5).toFixed(1) + "% of cross-border " + asset,
        metric: (1.1 + Math.random() * 5).toFixed(1) + "%"
      },
      {
        kind: "Volume",
        text: fmt(Math.max(2, Math.round(arc.orders / 90000))) + " " + asset + " orders " + from + " → " + to,
        metric: fmt(Math.max(2, Math.round(arc.orders / 90000)))
      },
      {
        kind: "STP",
        text: from + " to " + to + " straight-through at " + (90 + Math.random() * 8).toFixed(1) + "%",
        metric: (90 + Math.random() * 8).toFixed(1) + "%"
      },
      {
        kind: "Rank",
        text: from + " is #" + (1 + Math.floor(Math.random() * 6)) + " source for " + to + " " + asset,
        metric: "#" + (1 + Math.floor(Math.random() * 6))
      }
    ];
    return Object.assign({ arc: arc }, pick(templates));
  }

  function renderSide() {
    const panel = $("side-panel");
    if (!panel) return;
    const ticks = state.ticks.slice(0, 3);
    panel.innerHTML =
      '<div class="ticker" id="ticker">' +
      '<div class="ticker-head"><span class="dot" aria-hidden="true"></span>' +
      "<span>Network insights</span></div>" +
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
        '<p class="mcp-kicker">Calastone insights</p>' +
        "<h1>To query this data further, download the MCP here.</h1>" +
        '<p class="lede">Public network figures on the globe. Deeper cuts through the Calastone MCP in your AI assistant.</p>' +
        '<button type="button" class="btn btn-teal hotspot" id="card-download">Download MCP</button>';
      $("card-download").addEventListener("click", () => finishDownload());
      return;
    }

    if (state.cardStep === "prompt") {
      const market = state.market || "this market";
      card.innerHTML =
        brandHead() +
        '<p class="mcp-kicker">' +
        esc(market) +
        "</p>" +
        "<h1>To query " +
        esc(market) +
        " further, download the MCP here.</h1>" +
        '<p class="lede">Example: order volume and corridors for ' +
        esc(market) +
        ", by month.</p>" +
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

    card.innerHTML =
      brandHead() +
      '<p class="mcp-kicker done">Ready to add</p>' +
      "<h1>Paste this into your MCP client.</h1>" +
      "<pre>\"calastone\": {\n  \"command\": \"calastone-mcp\"\n}</pre>" +
      '<button type="button" class="btn btn-teal btn-sm" id="card-copy">' +
      (state.copied ? "Copied" : "Copy config") +
      "</button>" +
      '<button type="button" class="back" id="card-again">Back</button>';
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
    $("card-again").addEventListener("click", () => {
      state.cardStep = "intro";
      renderCard();
    });
  }

  function finishDownload() {
    const qs = new URLSearchParams({
      from: "globe",
      tier: "public",
      download: "1"
    });
    if (state.market) qs.set("market", state.market);
    if (typeof console !== "undefined" && console.info) {
      console.info("mcp_cta", { tier: "public", market: state.market || null });
    }
    location.href = "/pages/mcp-assistant?" + qs.toString();
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
    state.ticks = [insight, ...state.ticks].slice(0, 3);
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
      const p = Math.min(1, (now - t0) / 2200);
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
    pushTick();
    pushTick();
    renderSide();
    startStat();
  }

  window.iscReset = reset;
  window.openDownload = openDownload;

  function waitFlows(cb) {
    if (window.CALASTONE_FLOWS) cb();
    else setTimeout(() => waitFlows(cb), 50);
  }

  function init() {
    wire();
    setVariant(parseHash(), true);
    renderControls();
    renderCard();
    waitFlows(() => {
      startStat();
      pushTick();
      pushTick();
      renderSide();
      const loop = () => {
        pushTick();
        setTimeout(loop, TICK_MS);
      };
      setTimeout(loop, TICK_MS);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
