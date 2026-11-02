/* Fund Launch Radar: Market Movement globe + new ISIN notification */
(function () {
  const CAT = {
    regulatory: { color: "var(--radar-reg)", css: getCss("--radar-reg"), label: "REGULATORY", badge: "regulatory" },
    competitor: { color: "var(--radar-comp)", css: getCss("--radar-comp"), label: "COMPETITOR", badge: "competitor" },
    market: { color: "var(--radar-mkt)", css: getCss("--radar-mkt"), label: "MARKET", badge: "market" },
    call: { color: "var(--radar-call)", css: getCss("--radar-call"), label: "CALL NOTE", badge: "call" },
    identifier: { color: "var(--radar-id)", css: getCss("--radar-id"), label: "IDENTIFIER", badge: "identifier" },
  };

  const REGION_POV = {
    all: { lat: 25, lng: 8, altitude: 2.1 },
    emea: { lat: 30, lng: 20, altitude: 1.8 },
    americas: { lat: 10, lng: -80, altitude: 1.9 },
    asia: { lat: 20, lng: 105, altitude: 1.8 },
    australia: { lat: -28, lng: 135, altitude: 1.9 },
  };

  const GEO_URLS = [
    "/assets/geo/ne_110m_admin_0_countries.geojson",
    "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json",
  ];

  const motionOk = window.iscMotionOk
    ? window.iscMotionOk()
    : !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let ALERT_EVENTS = [];
  let COUNTRY_DETAILS = {};
  let LIVE_IDENTIFIER = null;
  let liveInjected = false;
  let approved = {};

  const catRank = { identifier: 5, regulatory: 4, competitor: 3, market: 2, call: 1 };
  const countryTopCat = {};
  const EVENT_BY_ID = {};
  const activeCats = new Set(["regulatory", "competitor", "market", "call", "identifier"]);
  let activeRegion = "all";
  let selectedEid = null;
  let globe = null;
  let autoResumeTimer = null;
  let wantAutoRotate = true;
  let toastTimer = null;
  let unreadActivity = 0;

  function getCss(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#007db7";
  }

  function $(id) {
    return document.getElementById(id);
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function rebuildIndexes() {
    Object.keys(countryTopCat).forEach((k) => delete countryTopCat[k]);
    Object.keys(EVENT_BY_ID).forEach((k) => delete EVENT_BY_ID[k]);
    ALERT_EVENTS.forEach((e) => {
      EVENT_BY_ID[e.eid] = e;
      const cur = countryTopCat[e.iso];
      if (!cur || catRank[e.cat] > cur.rank) {
        countryTopCat[e.iso] = { cat: e.cat, rank: catRank[e.cat] };
      }
    });
  }

  function matchesRegion(e) {
    return activeRegion === "all" || e.region === activeRegion;
  }

  function visiblePoints() {
    return ALERT_EVENTS.filter((e) => activeCats.has(e.cat) && matchesRegion(e));
  }

  function visibleFeedEvents() {
    return ALERT_EVENTS.filter((e) => activeCats.has(e.cat) && matchesRegion(e))
      .slice()
      .sort((a, b) => a.days - b.days);
  }

  function agoLabel(d) {
    if (d <= 0) return "just now";
    if (d === 1) return "1 day ago";
    if (d < 7) return d + " days ago";
    const w = Math.round(d / 7);
    return w + (w === 1 ? " week ago" : " weeks ago");
  }

  function truncate(s, n) {
    s = String(s || "");
    return s.length > n ? s.slice(0, n).trim() + "…" : s;
  }

  function polygonCapColor(d) {
    const iso = d.properties.ISO_A3;
    const top = countryTopCat[iso];
    if (!top || !activeCats.has(top.cat)) return "rgba(255,255,255,0.96)";
    if (activeRegion !== "all" && !ALERT_EVENTS.some((e) => e.iso === iso && e.region === activeRegion && activeCats.has(e.cat))) {
      return "rgba(255,255,255,0.96)";
    }
    return "rgba(188, 214, 220, 0.95)";
  }

  function polygonSideColor() {
    return "rgba(108,123,131,0.10)";
  }

  function polygonStroke() {
    return "rgba(108,123,131,0.42)";
  }

  function activeAlt(d) {
    const iso = d.properties.ISO_A3;
    const top = countryTopCat[iso];
    if (!top || !activeCats.has(top.cat)) return 0.006;
    if (activeRegion !== "all" && !ALERT_EVENTS.some((e) => e.iso === iso && e.region === activeRegion && activeCats.has(e.cat))) {
      return 0.006;
    }
    return 0.014;
  }

  function makeGlobeMaterial() {
    return new THREE.MeshBasicMaterial({
      color: 0xf4f8fa,
      transparent: true,
      opacity: 1,
    });
  }

  function makeFlashMarker(e) {
    const c = CAT[e.cat];
    const wrap = document.createElement("div");
    wrap.className = "flash-marker";
    wrap.dataset.eid = e.eid;
    wrap.style.color = c.css;
    wrap.innerHTML = '<span class="halo"></span><span class="core"></span>';
    wrap.addEventListener("click", (ev) => {
      ev.stopPropagation();
      selectEvent(e.eid);
    });
    return wrap;
  }

  function buildHoverCard(d) {
    const iso = d.properties.ISO_A3;
    const det = COUNTRY_DETAILS[iso];
    const name = d.properties.NAME || d.properties.ADMIN || iso;
    if (!det) {
      return '<div class="hover-card"><div class="hc-cty">' + escapeHtml(name) + '</div><div class="hc-empty">No active alerts</div></div>';
    }
    const evs = ALERT_EVENTS.filter((e) => e.iso === iso).length;
    return (
      '<div class="hover-card"><div class="hc-cty">' +
      escapeHtml((det.flag || "") + " " + det.name) +
      '</div><div class="hc-meta">' +
      escapeHtml(String(det.corridors)) +
      " corridors · " +
      escapeHtml(String(det.monthlyOrders)) +
      "/mo · " +
      evs +
      " alert" +
      (evs === 1 ? "" : "s") +
      "</div></div>"
    );
  }

  function identifierPanel(e) {
    if (e.cat !== "identifier") return "";
    const orgs = e.organisations || {};
    const approvedState = !!approved[e.eid];
    return (
      '<div class="exp-orgs">' +
      '<div class="exp-orgs-lbl">Detected</div>' +
      '<div class="isin-code" tabindex="0">' +
      escapeHtml(e.isin || "") +
      "</div>" +
      '<div class="org-line">' +
      escapeHtml(e.fund_name || e.type) +
      "</div>" +
      "</div>" +
      '<div class="exp-orgs">' +
      '<div class="exp-orgs-lbl">Resolved organisations</div>' +
      '<div class="org-line">Asset manager: ' +
      escapeHtml(orgs.asset_manager || "Not resolved") +
      "</div>" +
      '<div class="org-line">Transfer agent: ' +
      escapeHtml(orgs.transfer_agent || "Not resolved") +
      "</div>" +
      "</div>" +
      '<div class="exp-draft">' +
      '<div class="exp-draft-lbl">Outreach draft</div>' +
      '<div class="draft-text">' +
      escapeHtml(e.outreach_draft || "") +
      "</div>" +
      '<button type="button" class="approve-btn" data-approve="' +
      escapeHtml(e.eid) +
      '"' +
      (approvedState ? " disabled" : "") +
      ">" +
      (approvedState ? "Approved" : "Approve") +
      "</button>" +
      "</div>"
    );
  }

  function sourceHtml(e) {
    if (!e.source) return "";
    if (!e.source.url) {
      return (
        '<div class="exp-source"><div class="exp-source-lbl">Source</div><div class="muted">' +
        escapeHtml(e.source.name || "Calastone") +
        "</div></div>"
      );
    }
    return (
      '<div class="exp-source"><div class="exp-source-lbl">Source</div><a href="' +
      escapeHtml(e.source.url) +
      '" target="_blank" rel="noopener">' +
      escapeHtml(e.source.name) +
      "</a></div>"
    );
  }

  function renderFeed() {
    const feed = $("feed");
    const items = visibleFeedEvents();
    $("feed-sub").textContent = items.length + " active signals · sorted by recency";
    feed.innerHTML = "";
    items.forEach((e) => {
      const c = CAT[e.cat];
      const row = document.createElement("div");
      row.className = "row" + (e.eid === selectedEid ? " sel" : "");
      row.dataset.eid = e.eid;
      const factsHtml = (e.details && e.details.facts ? e.details.facts : [])
        .map((f) => "<li>" + escapeHtml(f) + "</li>")
        .join("");
      row.innerHTML =
        '<span class="row-dot" style="color:' +
        c.css +
        '" aria-hidden="true"></span>' +
        '<div class="row-body">' +
        '<div class="row-top">' +
        '<span class="flag">' +
        escapeHtml(e.flag || "") +
        "</span>" +
        '<span class="cty">' +
        escapeHtml(e.cty) +
        ' <span class="dash">-</span> <span class="ctype">' +
        escapeHtml(e.type) +
        "</span></span>" +
        '<span class="ago">' +
        agoLabel(e.days) +
        "</span>" +
        "</div>" +
        '<div class="headline">' +
        escapeHtml(e.summary) +
        "</div>" +
        '<div class="row-foot">' +
        '<span class="badge ' +
        c.badge +
        '">' +
        c.label +
        "</span>" +
        '<button type="button" class="moreinfo" data-eid="' +
        escapeHtml(e.eid) +
        '">Details <span class="mi-chev">▾</span></button>' +
        "</div>" +
        '<div class="expand" id="exp-' +
        escapeHtml(e.eid) +
        '">' +
        '<div class="exp-inner">' +
        '<div class="exp-loc">' +
        escapeHtml(e.city || e.cty) +
        "</div>" +
        "<h6>What is happening</h6><p>" +
        escapeHtml(e.details ? e.details.what : "") +
        "</p>" +
        "<h6>Why it matters</h6><p>" +
        escapeHtml(e.details ? e.details.why : "") +
        "</p>" +
        '<h6>Key facts</h6><ul class="facts">' +
        factsHtml +
        "</ul>" +
        sourceHtml(e) +
        identifierPanel(e) +
        "</div></div></div>";
      row.addEventListener("click", (ev) => {
        if (ev.target.closest(".moreinfo") || ev.target.closest(".approve-btn") || ev.target.closest(".expand")) {
          return;
        }
        selectEvent(e.eid);
      });
      feed.appendChild(row);
    });

    feed.querySelectorAll(".moreinfo").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        toggleExpand(btn.dataset.eid, btn);
      });
    });
    feed.querySelectorAll(".approve-btn").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        approveDraft(btn.getAttribute("data-approve"), btn);
      });
    });

    if (motionOk && window.anime) {
      anime({
        targets: "#feed .row",
        opacity: [0, 1],
        translateY: [-8, 0],
        delay: anime.stagger(40),
        duration: 380,
        easing: "easeOutQuart",
      });
    }
  }

  function toggleExpand(eid, btn) {
    const exp = $("exp-" + eid);
    if (!exp) return;
    const open = exp.classList.toggle("open");
    if (btn) btn.classList.toggle("on", open);
    if (open) {
      const inner = exp.querySelector(".exp-inner");
      exp.style.maxHeight = inner.scrollHeight + "px";
      if (motionOk && window.anime) {
        anime({
          targets: inner,
          opacity: [0, 1],
          translateY: [-6, 0],
          duration: 320,
          easing: "easeOutQuart",
        });
      }
    } else {
      exp.style.maxHeight = "0px";
    }
  }

  function selectEvent(eid) {
    const e = EVENT_BY_ID[eid];
    if (!e) return;
    if (selectedEid === eid) {
      deselectEvent();
      return;
    }
    selectedEid = eid;
    $("feed-rail").classList.remove("collapsed");
    $("app").classList.remove("feed-closed");
    $("feed-toggle").setAttribute("aria-expanded", "true");
    if (globe) globe.pointOfView({ lat: e.lat, lng: e.lng, altitude: 1.6 }, motionOk ? 1200 : 0);
    document.querySelectorAll("#feed .row").forEach((r) => r.classList.toggle("sel", r.dataset.eid === eid));
    const row = document.querySelector('#feed .row[data-eid="' + eid + '"]');
    if (row) {
      row.scrollIntoView({ behavior: motionOk ? "smooth" : "auto", block: "start" });
      const btn = row.querySelector(".moreinfo");
      const exp = $("exp-" + eid);
      if (exp && !exp.classList.contains("open")) {
        setTimeout(() => toggleExpand(eid, btn), motionOk ? 120 : 0);
      }
    }
    const marker = document.querySelector('.flash-marker[data-eid="' + eid + '"]');
    if (marker) {
      marker.classList.remove("ping");
      void marker.offsetWidth;
      marker.classList.add("ping");
    }
  }

  function deselectEvent() {
    const prev = selectedEid;
    selectedEid = null;
    document.querySelectorAll("#feed .row").forEach((r) => r.classList.remove("sel"));
    if (prev) {
      const exp = $("exp-" + prev);
      const btn = document.querySelector('#feed .row[data-eid="' + prev + '"] .moreinfo');
      if (exp && exp.classList.contains("open")) toggleExpand(prev, btn);
    }
    if (globe) globe.pointOfView(REGION_POV.all, motionOk ? 900 : 0);
  }

  function approveDraft(eid, btn) {
    if (!eid) return;
    approved[eid] = true;
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Approved";
    }
    const exp = $("exp-" + eid);
    if (exp && exp.classList.contains("open")) {
      const inner = exp.querySelector(".exp-inner");
      if (inner) exp.style.maxHeight = inner.scrollHeight + "px";
    }
    document.querySelectorAll('.approve-btn[data-approve="' + eid + '"]').forEach((el) => {
      el.disabled = true;
      el.textContent = "Approved";
    });
  }

  function updateCounts() {
    const by = (c) => ALERT_EVENTS.filter((e) => e.cat === c).length;
    const set = (id, n) => {
      const el = $(id);
      if (el) el.textContent = String(n);
    };
    set("c-reg", by("regulatory"));
    set("c-comp", by("competitor"));
    set("c-mkt", by("market"));
    set("c-call", by("call"));
    set("c-id", by("identifier"));

    const high = ALERT_EVENTS.filter((e) => e.sev === "high").length;
    set("stat-alerts", ALERT_EVENTS.length);
    set("stat-high", high);
    const alertEl = $("stat-alerts");
    if (alertEl) alertEl.dataset.count = String(ALERT_EVENTS.length);
    updateActivityBadge();
  }

  function updateActivityBadge() {
    const badge = $("activity-badge");
    const bell = $("activity-bell");
    if (!badge || !bell) return;
    if (unreadActivity > 0) {
      badge.hidden = false;
      badge.textContent = unreadActivity > 99 ? "99+" : String(unreadActivity);
      bell.classList.add("has-activity");
      bell.setAttribute("aria-label", "Activity notifications, " + unreadActivity + " new");
    } else {
      badge.hidden = true;
      badge.textContent = "0";
      bell.classList.remove("has-activity");
      bell.setAttribute("aria-label", "Activity notifications");
    }
  }

  function clearActivityBadge() {
    unreadActivity = 0;
    updateActivityBadge();
  }

  function openFeedRail() {
    $("feed-rail").classList.remove("collapsed");
    $("app").classList.remove("feed-closed");
    $("feed-toggle").setAttribute("aria-expanded", "true");
  }

  function applyFilter() {
    renderFeed();
    if (!globe) return;
    globe.htmlElementsData(visiblePoints());
    globe.polygonCapColor(polygonCapColor).polygonAltitude(activeAlt);
  }

  function animateStats() {
    if (!motionOk || !window.anime) return;
    document.querySelectorAll("[data-count]").forEach((el) => {
      const t = +el.dataset.count;
      const o = { v: 0 };
      anime({
        targets: o,
        v: t,
        duration: 1400,
        easing: "easeOutExpo",
        round: 1,
        update: () => {
          el.textContent = Math.round(o.v);
        },
      });
    });
  }

  function initGlobe(geo) {
    $("globe-loading").hidden = true;
    const stage = $("stage");
    globe = Globe()
      .width(stage.clientWidth)
      .height(stage.clientHeight)
      .backgroundColor("rgba(0,0,0,0)")
      .showGlobe(true)
      .showGraticules(false)
      .showAtmosphere(true)
      .atmosphereColor("#9fc6d4")
      .atmosphereAltitude(0.16)
      .globeMaterial(makeGlobeMaterial())
      .polygonsData(geo.features)
      .polygonCapColor(polygonCapColor)
      .polygonSideColor(polygonSideColor)
      .polygonStrokeColor(polygonStroke)
      .polygonAltitude(activeAlt)
      .polygonLabel((d) => buildHoverCard(d))
      .onPolygonHover((hoverP) => {
        globe.polygonAltitude((d) => (d === hoverP ? 0.03 : activeAlt(d)));
      })
      .onPolygonClick((d) => {
        const iso = d.properties.ISO_A3;
        const ev = ALERT_EVENTS.find((x) => x.iso === iso && activeCats.has(x.cat) && matchesRegion(x));
        if (ev) {
          selectEvent(ev.eid);
          globe.pointOfView({ lat: ev.lat, lng: ev.lng, altitude: 1.6 }, motionOk ? 1200 : 0);
        }
      })
      .htmlElementsData(visiblePoints())
      .htmlLat("lat")
      .htmlLng("lng")
      .htmlAltitude(0.01)
      .htmlElement((e) => makeFlashMarker(e))(document.getElementById("globe-container"));

    const ctrl = globe.controls();
    ctrl.autoRotate = wantAutoRotate && motionOk;
    ctrl.autoRotateSpeed = 0.34;
    ctrl.enableZoom = true;
    ctrl.minDistance = 180;
    ctrl.maxDistance = 520;
    globe.pointOfView(REGION_POV.all, 0);

    const scene = globe.scene();
    scene.children.filter((c) => c.type.includes("Light")).forEach((l) => scene.remove(l));
    scene.add(new THREE.AmbientLight(0xffffff, 1.05));
    const dir = new THREE.DirectionalLight(0xffffff, 0.25);
    dir.position.set(1, 1, 1);
    scene.add(dir);

    const container = $("globe-container");
    container.addEventListener("pointerdown", () => {
      ctrl.autoRotate = false;
      clearTimeout(autoResumeTimer);
    });
    container.addEventListener("pointerup", () => {
      clearTimeout(autoResumeTimer);
      if (wantAutoRotate && motionOk) {
        autoResumeTimer = setTimeout(() => {
          ctrl.autoRotate = true;
        }, 3000);
      }
    });

    window.addEventListener("resize", () => {
      globe.width(stage.clientWidth).height(stage.clientHeight);
    });
  }

  function roughCentroid(f) {
    let coords = f.geometry.coordinates;
    if (f.geometry.type === "MultiPolygon") {
      coords = coords.reduce((a, b) => (a[0].length > b[0].length ? a : b));
    }
    const ring = coords[0] || [[0, 0]];
    let x = 0;
    let y = 0;
    ring.forEach((p) => {
      x += p[0];
      y += p[1];
    });
    return [x / ring.length, y / ring.length];
  }

  function ensureTopojson() {
    return new Promise((resolve, reject) => {
      if (window.topojson) return resolve();
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js";
      s.onload = resolve;
      s.onerror = () => reject(new Error("topojson load failed"));
      document.head.appendChild(s);
    });
  }

  const NAME_TO_ISO = {
    Netherlands: "NLD",
    Mexico: "MEX",
    "United Kingdom": "GBR",
    Australia: "AUS",
    India: "IND",
    Luxembourg: "LUX",
    Belgium: "BEL",
    Spain: "ESP",
    Singapore: "SGP",
    Ireland: "IRL",
    "United States of America": "USA",
    "United States": "USA",
    Japan: "JPN",
    China: "CHN",
    Germany: "DEU",
    Brazil: "BRA",
    France: "FRA",
    "South Africa": "ZAF",
    Taiwan: "TWN",
    "United Arab Emirates": "ARE",
    Canada: "CAN",
    Sweden: "SWE",
    Switzerland: "CHE",
    "Hong Kong": "HKG",
  };

  async function loadGeo() {
    const loadingEl = $("globe-loading");
    const errEl = $("err");
    errEl.hidden = true;
    loadingEl.hidden = false;
    loadingEl.textContent = "Loading network map…";

    for (let i = 0; i < GEO_URLS.length; i++) {
      const url = GEO_URLS[i];
      try {
        const res = await fetch(url, { cache: "force-cache" });
        if (!res.ok) throw new Error("HTTP " + res.status);
        let data = await res.json();
        let features;
        if (data.type === "Topology") {
          await ensureTopojson();
          const obj = data.objects.countries || Object.values(data.objects)[0];
          features = window.topojson.feature(data, obj).features;
          features.forEach((f) => {
            if (!f.properties) f.properties = {};
            if (!f.properties.ISO_A3 && f.properties.name) {
              f.properties.ISO_A3 = NAME_TO_ISO[f.properties.name] || "";
            }
          });
        } else {
          features = data.features;
        }
        features = features.filter((f) => (f.properties.ISO_A3 || f.properties.ISO_A3_EH) !== "ATA");
        features.forEach((f) => {
          const p = f.properties;
          if ((!p.ISO_A3 || p.ISO_A3 === "-99") && p.ISO_A3_EH) p.ISO_A3 = p.ISO_A3_EH;
          if (p.LABEL_Y == null || p.LABEL_X == null) {
            const c = roughCentroid(f);
            p.LABEL_Y = c[1];
            p.LABEL_X = c[0];
          }
        });
        initGlobe({ features });
        return;
      } catch (err) {
        console.warn("GeoJSON source failed:", url, err.message);
      }
    }
    loadingEl.hidden = true;
    errEl.hidden = false;
  }

  function injectLiveIdentifier() {
    if (!LIVE_IDENTIFIER || liveInjected) return;
    liveInjected = true;
    ALERT_EVENTS = [LIVE_IDENTIFIER].concat(ALERT_EVENTS.filter((e) => e.eid !== LIVE_IDENTIFIER.eid));
    rebuildIndexes();
    unreadActivity += 1;
    updateCounts();
    applyFilter();
    if (globe) {
      const marker = document.querySelector('.flash-marker[data-eid="' + LIVE_IDENTIFIER.eid + '"]');
      if (marker) {
        marker.classList.remove("ping");
        void marker.offsetWidth;
        marker.classList.add("ping");
      }
    }
  }

  function scheduleLiveIdentifier() {
    clearTimeout(toastTimer);
    if (!LIVE_IDENTIFIER) return;
    if (motionOk) toastTimer = setTimeout(injectLiveIdentifier, 1800);
    else injectLiveIdentifier();
  }

  function wireUi() {
    document.querySelectorAll("#legend .lg-item").forEach((item) => {
      item.addEventListener("click", () => {
        const cat = item.dataset.cat;
        if (activeCats.has(cat)) {
          activeCats.delete(cat);
          item.classList.remove("on");
        } else {
          activeCats.add(cat);
          item.classList.add("on");
        }
        applyFilter();
      });
    });

    document.querySelectorAll("#regionFilters .rf-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeRegion = btn.dataset.region;
        document.querySelectorAll("#regionFilters .rf-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        selectedEid = null;
        applyFilter();
        if (globe) {
          const pov = REGION_POV[activeRegion] || REGION_POV.all;
          globe.pointOfView(pov, motionOk ? 1200 : 0);
        }
      });
    });

    document.querySelectorAll(".pill").forEach((p) => {
      p.addEventListener("click", () => {
        const v = p.dataset.view;
        if (v === "reset") {
          if (globe) globe.pointOfView(REGION_POV.all, motionOk ? 1000 : 0);
          return;
        }
        document.querySelectorAll('.pill[data-view="rotate"],.pill[data-view="pause"]').forEach((x) => x.classList.remove("active"));
        p.classList.add("active");
        if (!globe) return;
        if (v === "rotate") {
          wantAutoRotate = true;
          globe.controls().autoRotate = motionOk;
        }
        if (v === "pause") {
          wantAutoRotate = false;
          globe.controls().autoRotate = false;
          clearTimeout(autoResumeTimer);
        }
      });
    });

    $("feed-toggle").addEventListener("click", () => {
      const collapsed = $("feed-rail").classList.toggle("collapsed");
      $("app").classList.toggle("feed-closed", collapsed);
      $("feed-toggle").setAttribute("aria-expanded", collapsed ? "false" : "true");
      setTimeout(() => {
        if (globe) {
          const s = $("stage");
          globe.width(s.clientWidth).height(s.clientHeight);
        }
      }, motionOk ? 440 : 0);
    });

    const bell = $("activity-bell");
    if (bell) {
      bell.addEventListener("click", () => {
        openFeedRail();
        clearActivityBadge();
        if (LIVE_IDENTIFIER && EVENT_BY_ID[LIVE_IDENTIFIER.eid]) {
          selectEvent(LIVE_IDENTIFIER.eid);
        } else {
          const first = visibleFeedEvents()[0];
          if (first) selectEvent(first.eid);
        }
      });
    }

    $("retry-geo").addEventListener("click", loadGeo);
  }

  function resetDemo() {
    approved = {};
    liveInjected = false;
    selectedEid = null;
    unreadActivity = 0;
    updateActivityBadge();
    if (LIVE_IDENTIFIER) {
      ALERT_EVENTS = ALERT_EVENTS.filter((e) => e.eid !== LIVE_IDENTIFIER.eid);
    }
    rebuildIndexes();
    updateCounts();
    applyFilter();
    if (globe) globe.pointOfView(REGION_POV.all, motionOk ? 900 : 0);
    scheduleLiveIdentifier();
  }

  window.iscReset = resetDemo;

  async function boot() {
    wireUi();
    try {
      const res = await fetch("/data/fund-launch-radar/alerts.json");
      if (!res.ok) throw new Error("alerts HTTP " + res.status);
      const data = await res.json();
      ALERT_EVENTS = Array.isArray(data.events) ? data.events.slice() : [];
      COUNTRY_DETAILS = data.countries || {};
      LIVE_IDENTIFIER = data.live_identifier || null;
      rebuildIndexes();
      updateCounts();
      renderFeed();
      animateStats();
      await loadGeo();
      scheduleLiveIdentifier();
    } catch (err) {
      console.error(err);
      $("globe-loading").textContent = "Alert data did not load.";
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
