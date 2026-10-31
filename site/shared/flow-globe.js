/* <flow-globe>: Calastone network-overview globe (globe.gl).
   Attributes: theme="light|ink"  arcs="all|major"  spin="on|off"  pov="lat,lng,alt"
   Events (window): 'flowglobe:select' {source, node, out, inn}
   Listens: 'flowglobe:pulse' {arc}
*/
(function () {
  const CSTOPS = [[0, [11, 121, 174]], [0.4, [27, 150, 170]], [0.72, [38, 160, 140]], [1, [105, 160, 103]]];
  function rampRGB(t) {
    t = Math.max(0, Math.min(1, t));
    for (let i = 0; i < CSTOPS.length - 1; i++) {
      const [p0, c0] = CSTOPS[i];
      const [p1, c1] = CSTOPS[i + 1];
      if (t >= p0 && t <= p1) {
        const u = (t - p0) / (p1 - p0);
        return [0, 1, 2].map((k) => Math.round(c0[k] + (c1[k] - c0[k]) * u));
      }
    }
    return CSTOPS[3][1];
  }

  const ALIAS = {
    "United States of America": "US",
    Czechia: "CZ",
    Brunei: "BN",
    Taiwan: "TW",
    "United Kingdom": "GB"
  };

  const fmt = (n) =>
    n >= 1e9 ? (n / 1e9).toFixed(1) + "bn" :
    n >= 1e6 ? (n / 1e6).toFixed(1) + "m" :
    n >= 1e3 ? (n / 1e3).toFixed(1) + "k" :
    String(n);
  window.fmtFlow = fmt;

  function motionOk() {
    return window.iscMotionOk ? window.iscMotionOk() : !matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  let worldP = null;
  function loadWorld() {
    if (!worldP) {
      worldP = fetch("https://unpkg.com/world-atlas@2.0.2/countries-110m.json")
        .then((r) => r.json())
        .then((t) =>
          window.topojson
            .feature(t, t.objects.countries)
            .features.filter((f) => f.properties.name !== "Antarctica")
        );
    }
    return worldP;
  }

  const THEMES = {
    light: {
      globe: "#eef5f9",
      emis: "#e8f1f6",
      ei: 0.85,
      atm: "#9fc6d8",
      atmAlt: 0.2,
      base: [233, 242, 247],
      none: "rgba(214,224,232,0.92)",
      side: "rgba(150,170,190,0.25)",
      stroke: "rgba(120,150,180,0.3)",
      point: "#0b79ae",
      arcA: 0.45,
      ring: "15,184,156"
    },
    ink: {
      globe: "#111b22",
      emis: "#0d1418",
      ei: 0.55,
      atm: "#2f7d9c",
      atmAlt: 0.18,
      base: [30, 44, 54],
      none: "rgba(38,52,63,0.96)",
      side: "rgba(20,30,38,0.5)",
      stroke: "rgba(122,150,170,0.22)",
      point: "#3fa7d6",
      arcA: 0.55,
      ring: "46,203,177"
    }
  };

  const TIP =
    "position:absolute;pointer-events:none;opacity:0;transition:opacity .15s;" +
    "background:#fff;border:1px solid #dde4ea;border-radius:10px;" +
    "box-shadow:0 12px 28px rgba(34,50,61,.12),0 4px 8px rgba(34,50,61,.06);" +
    "padding:10px 14px;font-family:var(--font);color:#22323d;min-width:170px;z-index:5;";

  class FlowGlobe extends HTMLElement {
    static get observedAttributes() {
      return ["arcs", "spin", "theme", "pov"];
    }

    connectedCallback() {
      if (this._init) return;
      this._init = true;
      Object.assign(this.style, { display: "block", position: "relative", width: "100%", height: "100%" });
      this.mount = document.createElement("div");
      this.mount.style.cssText = "position:absolute;inset:0;cursor:grab";
      this.tip = document.createElement("div");
      this.tip.style.cssText = TIP;
      this.append(this.mount, this.tip);
      this.addEventListener("mousemove", (e) => {
        const r = this.getBoundingClientRect();
        this.tip.style.left = e.clientX - r.left + 16 + "px";
        this.tip.style.top = e.clientY - r.top + 16 + "px";
      });
      const wait = () =>
        window.Globe && window.topojson && window.CALASTONE_FLOWS
          ? this.build()
          : setTimeout(wait, 60);
      wait();
    }

    disconnectedCallback() {
      if (this._ro) this._ro.disconnect();
      window.removeEventListener("flowglobe:pulse", this._onPulse);
      clearTimeout(this._ignite);
      if (this.globe) {
        try {
          this.globe._destructor && this.globe._destructor();
        } catch (e) { /* ignore */ }
      }
    }

    attributeChangedCallback(name) {
      if (!this.globe) return;
      if (name === "arcs") this.applyArcs();
      if (name === "spin") this.applySpin();
      if (name === "pov") this.applyPov();
      if (name === "theme") this.rebuildTheme();
    }

    tipShow(html) {
      this.tip.innerHTML = html;
      this.tip.style.opacity = 1;
    }

    tipHide() {
      this.tip.style.opacity = 0;
    }

    applySpin() {
      if (!this.ctrl) return;
      const want = this.getAttribute("spin") !== "off" && !this._hovering && motionOk();
      this.ctrl.autoRotate = want;
    }

    applyPov(duration) {
      if (!this.globe) return;
      const pov = (this.getAttribute("pov") || "38,8,2.1").split(",").map(Number);
      this.globe.pointOfView(
        { lat: pov[0], lng: pov[1], altitude: pov[2] },
        duration == null ? (motionOk() ? 0 : 0) : duration
      );
    }

    visibleArcs() {
      const D = window.CALASTONE_FLOWS;
      const a = D.arcs.filter((x) => !x.intra);
      return this.getAttribute("arcs") === "major" ? a.filter((x) => x.orders >= 100000) : a;
    }

    applyArcs() {
      if (this.globe) this.globe.arcsData(this.visibleArcs());
    }

    rebuildTheme() {
      // Theme changes require a rebuild; parent replaces the element instead.
    }

    async build() {
      const D = window.CALASTONE_FLOWS;
      const T = THEMES[this.getAttribute("theme")] || THEMES.light;
      const maxArc = D.meta.maxArc;
      const maxNode = D.meta.maxNode;
      const byId = Object.fromEntries(D.nodes.map((n) => [n.id, n]));
      const nameToId = Object.fromEntries(D.nodes.map((n) => [n.name, n.id]));
      const world = await loadWorld();
      const feats = world.map((f) => ({
        ...f,
        properties: {
          ...f.properties,
          iso2: ALIAS[f.properties.name] || nameToId[f.properties.name]
        }
      }));

      const landColor = (f) => {
        const n = byId[f.properties.iso2];
        if (!n) return T.none;
        const t = Math.pow(n.total / maxNode, 0.4);
        const [r, g, b] = rampRGB(t);
        const k = 0.2 + 0.8 * t;
        const dark = this.getAttribute("theme") === "ink" ? 1 : 1 - 0.42 * t;
        const c = [r, g, b].map((v, i) => Math.round((T.base[i] + (v - T.base[i]) * k) * dark));
        return "rgba(" + c[0] + "," + c[1] + "," + c[2] + ",0.96)";
      };

      const arcColor = (d) => {
        const s = Math.sqrt(d.orders / maxArc);
        const [r, g, b] = rampRGB(s);
        return "rgba(" + r + "," + g + "," + b + "," + (T.arcA + 0.45 * s) + ")";
      };

      const top = (id) => ({
        out: D.arcs.filter((a) => a.fromIso === id).sort((x, y) => y.orders - x.orders).slice(0, 3),
        inn: D.arcs.filter((a) => a.toIso === id).sort((x, y) => y.orders - x.orders).slice(0, 3)
      });

      const nodeTip = (n) =>
        this.tipShow(
          '<div style="font-size:15px;font-weight:600;color:#0d1418">' + n.name + "</div>" +
          '<div style="font-size:26px;line-height:1.1;margin-top:4px;color:#0d1418">' + fmt(n.total) + "</div>" +
          '<div style="font-size:12px;color:#7a8893;margin-top:2px">orders placed + received · 2025</div>' +
          '<div style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#2d9a8e;margin-top:8px">Click for deeper data</div>'
        );

      const arcTip = (a) =>
        this.tipShow(
          '<div style="font-size:14px;font-weight:600;color:#0d1418">' +
          a.from + ' <span style="color:#2d9a8e">→</span> ' + a.to + "</div>" +
          '<div style="font-size:26px;line-height:1.1;margin-top:4px;color:#0d1418">' + fmt(a.orders) + "</div>" +
          '<div style="font-size:12px;color:#7a8893;margin-top:2px">' +
          ((a.orders / D.meta.liveTotal) * 100).toFixed(2) + "% of all live network volume</div>"
        );

      const hover = (on, fn) => {
        this._hovering = !!on;
        if (on) fn();
        else this.tipHide();
        this.mount.style.cursor = on ? "pointer" : "grab";
        this.applySpin();
      };

      const select = (n) => {
        if (!n) return;
        const c = top(n.id);
        this.globe.pointOfView(
          { lat: n.lat, lng: n.lng, altitude: 1.7 },
          motionOk() ? 1100 : 0
        );
        window.dispatchEvent(
          new CustomEvent("flowglobe:select", {
            detail: { source: this.id, node: n, out: c.out, inn: c.inn }
          })
        );
      };

      const g = (this.globe = window
        .Globe()(this.mount)
        .backgroundColor("rgba(0,0,0,0)")
        .showAtmosphere(true)
        .showGlobe(true));

      try {
        const m = g.globeMaterial();
        m.color.set(T.globe);
        m.emissive.set(T.emis);
        m.emissiveIntensity = T.ei;
        m.shininess = 0;
        m.needsUpdate = true;
      } catch (e) { /* ignore */ }

      const animate = motionOk();
      g.atmosphereColor(T.atm)
        .atmosphereAltitude(T.atmAlt)
        .polygonsData(feats)
        .polygonCapColor(landColor)
        .polygonSideColor(() => T.side)
        .polygonStrokeColor(() => T.stroke)
        .polygonAltitude(0.006)
        .polygonsTransitionDuration(animate ? 300 : 0)
        .pointsData(D.nodes)
        .pointLat((d) => d.lat)
        .pointLng((d) => d.lng)
        .pointColor(() => T.point)
        .pointAltitude(0.008)
        .pointRadius((d) => 0.28 + 1.0 * Math.sqrt(d.total / maxNode))
        .pointResolution(14)
        .arcsData([])
        .arcStartLat((d) => d.startLat)
        .arcStartLng((d) => d.startLng)
        .arcEndLat((d) => d.endLat)
        .arcEndLng((d) => d.endLng)
        .arcColor(arcColor)
        .arcStroke((d) => 0.18 + 1.5 * Math.sqrt(d.orders / maxArc))
        .arcAltitudeAutoScale(0.5)
        .arcDashLength(animate ? 0.45 : 1)
        .arcDashGap(animate ? 0.6 : 0)
        .arcDashInitialGap(() => (animate ? Math.random() : 0))
        .arcDashAnimateTime((d) =>
          animate ? Math.max(1400, 5200 - 3600 * Math.sqrt(d.orders / maxArc)) : 0
        )
        .arcsTransitionDuration(0)
        .ringsData([])
        .ringLat((d) => d.lat)
        .ringLng((d) => d.lng)
        .ringColor(() => (t) => "rgba(" + T.ring + "," + (1 - t) * 0.9 + ")")
        .ringMaxRadius(3.2)
        .ringPropagationSpeed(2.4)
        .ringRepeatPeriod(4000)
        .ringAltitude(0.012)
        .onPolygonHover((f) => {
          const n = f && byId[f.properties.iso2];
          g.polygonAltitude((ff) => (ff === f && n ? 0.02 : 0.006));
          hover(n, () => nodeTip(n));
        })
        .onPolygonClick((f) => select(f && byId[f.properties.iso2]))
        .onPointHover((n) => hover(n, () => nodeTip(n)))
        .onPointClick((n) => select(n))
        .onArcHover((a) => hover(a, () => arcTip(a)));

      this.applyPov(0);
      this.ctrl = g.controls();
      this.ctrl.enableZoom = false;
      this.ctrl.autoRotateSpeed = 0.16;
      this.applySpin();

      const size = () => {
        const r = this.getBoundingClientRect();
        if (r.width && r.height) g.width(this.offsetWidth).height(this.offsetHeight);
      };
      this._ro = new ResizeObserver(size);
      this._ro.observe(this);
      size();

      const sorted = [...this.visibleArcs()].sort((a, b) => b.orders - a.orders);
      if (!animate) {
        g.arcsData(sorted);
      } else {
        const batch = Math.ceil(sorted.length / 14);
        let idx = 0;
        let shown = [];
        const step = () => {
          shown = shown.concat(sorted.slice(idx, idx + batch));
          idx += batch;
          g.arcsData(shown);
          if (idx < sorted.length) this._ignite = setTimeout(step, 75);
        };
        step();
      }

      this.rings = [];
      this._onPulse = (e) => {
        if (!animate || !e.detail || !e.detail.arc) return;
        const a = e.detail.arc;
        const r1 = { lat: a.startLat, lng: a.startLng };
        const r2 = { lat: a.endLat, lng: a.endLng };
        this.rings.push(r1, r2);
        g.ringsData(this.rings.slice());
        setTimeout(() => {
          this.rings = this.rings.filter((x) => x !== r1 && x !== r2);
          g.ringsData(this.rings.slice());
        }, 1800);
      };
      window.addEventListener("flowglobe:pulse", this._onPulse);
    }
  }

  if (!customElements.get("flow-globe")) customElements.define("flow-globe", FlowGlobe);
})();
