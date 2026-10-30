(function () {
  const motionOk = () => (window.iscMotionOk ? window.iscMotionOk() : !matchMedia("(prefers-reduced-motion: reduce)").matches);
  const FFI_MONTH = "2026-09";
  const LONDON = { lat: 51.51, lng: -0.13 };
  const ANCHORS = {
    "north-america": { lat: 42, lng: -95 },
    europe: { lat: 48.5, lng: 12 },
    japan: { lat: 36.2, lng: 138.3 },
    china: { lat: 34.5, lng: 104 },
    "asia-pacific": { lat: 5, lng: 110 }
  };
  const STRIP = new Set(["global", "emerging-markets", "sector"]);
  const LAND = "rgba(214,224,232,0.92)";
  const UK_WASH = "rgba(186,214,216,0.96)";

  let net, ffi, world, byIso, selectedIso, skipOceanClose;

  const $ = (id) => document.getElementById(id);

  function log(event, fields) {
    console.log(Object.assign({ event: event }, fields));
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function fmtExact(n) {
    const sign = n > 0 ? "+" : n < 0 ? "-" : "";
    return sign + Math.abs(n).toLocaleString("en-GB");
  }

  function round10(n) {
    return Math.round(n / 10) * 10;
  }

  function prettyMonth(ym) {
    const [year, month] = ym.split("-");
    const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return names[Number(month) - 1] + " " + year;
  }

  function isoOf(props) {
    if (props.ISO_A2 && props.ISO_A2 !== "-99") return props.ISO_A2;
    if (props.ISO_A2_EH && props.ISO_A2_EH !== "-99") return props.ISO_A2_EH;
    return null;
  }

  function latestMonth() {
    return net.months[net.months.length - 1];
  }

  function countryName(feature) {
    const iso = feature.properties._iso;
    if (iso && byIso.has(iso)) return byIso.get(iso).name;
    return feature.properties.NAME || feature.properties.ADMIN || "This country";
  }

  function illustrativeNet(iso) {
    const country = byIso.get(iso);
    if (!country || !country.investor_view || !country.investor_view.series) return null;
    const row = country.investor_view.series.find((item) => item.month === latestMonth());
    if (!row) return null;
    return round10(row.net);
  }

  function ffiStory() {
    const sectors = ffi.equity_sectors[FFI_MONTH] || [];
    const arcs = [];
    let ring = null;
    const strip = [];
    const sized = sectors.filter((item) => item.net_flow_gbp_m != null && ANCHORS[item.region]);
    const max = Math.max.apply(null, sized.map((item) => Math.abs(item.net_flow_gbp_m)).concat([1]));
    sectors.forEach((item) => {
      if (item.region === "uk") {
        ring = {
          lat: LONDON.lat,
          lng: LONDON.lng,
          color: (item.net_flow_gbp_m || 0) >= 0 ? "rgba(53,181,126,0.85)" : "rgba(208,84,84,0.8)",
          maxR: 2.4,
          speed: 0,
          period: 100000
        };
        return;
      }
      if (!ANCHORS[item.region] || STRIP.has(item.region)) {
        strip.push(item);
        return;
      }
      const unpublished = item.net_flow_gbp_m == null;
      const value = item.net_flow_gbp_m || 0;
      const inflow = value > 0;
      const share = unpublished ? 0.15 : Math.sqrt(Math.abs(value) / max);
      const anchor = ANCHORS[item.region];
      arcs.push({
        startLat: inflow || unpublished ? LONDON.lat : anchor.lat,
        startLng: inflow || unpublished ? LONDON.lng : anchor.lng,
        endLat: inflow || unpublished ? anchor.lat : LONDON.lat,
        endLng: inflow || unpublished ? anchor.lng : LONDON.lng,
        color: unpublished ? "rgba(122,136,147,0.7)" : (inflow ? "rgba(53,181,126,0.9)" : "rgba(208,84,84,0.9)"),
        stroke: 0.18 + 1.5 * share,
        dashLength: unpublished ? 0.2 : 0.55,
        dashGap: unpublished ? 0.12 : 0.2,
        dashTime: motionOk() ? Math.max(1400, 4200 - 2000 * share) : 0
      });
    });
    return { arcs: arcs, ring: ring, strip: strip };
  }

  function renderHero() {
    const row = ffi.asset_classes.monthly[FFI_MONTH] || {};
    const head = (ffi.headlines[FFI_MONTH] || {}).headline || "";
    $("hero-count").innerHTML = fmtExact(row.equities) + "<span>GBP m</span>";
    $("hero-headline").textContent = head;
    const story = ffiStory();
    $("strip").innerHTML = story.strip.map((item) => {
      const flow = item.net_flow_gbp_m == null
        ? "outflow, figure not published"
        : fmtExact(item.net_flow_gbp_m) + " GBP m";
      return "<li><span>" + esc(item.label_in_report) + "</span> " + flow + "</li>";
    }).join("");
    return story;
  }

  function showCard(iso, name) {
    selectedIso = iso;
    const card = $("country-card");
    const value = iso ? illustrativeNet(iso) : null;
    $("card-name").textContent = name;
    const badge = $("card-badge");
    if (value == null) {
      $("card-line").textContent = "Nothing to show for this country.";
      badge.hidden = true;
    } else {
      $("card-line").textContent = fmtExact(value) + " USD m net, " + prettyMonth(latestMonth()) + ".";
      badge.hidden = false;
    }
    card.hidden = false;
    log("country_open", { iso: iso, illustrative: value != null });
  }

  function clearCard() {
    selectedIso = null;
    $("country-card").hidden = true;
  }

  function placeHover(event) {
    const tip = $("hover-card");
    if (tip.hidden) return;
    const x = Math.min(event.clientX + 14, window.innerWidth - 180);
    const y = Math.min(event.clientY + 14, window.innerHeight - 40);
    tip.style.left = x + "px";
    tip.style.top = y + "px";
  }

  function bootGlobe(geo) {
    const GlobeFn = window.Globe;
    if (!GlobeFn) {
      $("globe-status").textContent = "The globe library did not load.";
      return;
    }
    geo.features.forEach((feature) => {
      feature.properties._iso = isoOf(feature.properties);
    });
    const story = renderHero();
    const holder = $("globe");
    world = GlobeFn()(holder)
      .backgroundColor("rgba(0,0,0,0)")
      .showAtmosphere(true)
      .atmosphereColor("#9fc6d8")
      .atmosphereAltitude(0.2)
      .polygonsData(geo.features)
      .polygonCapColor((feature) => (feature.properties._iso === "GB" ? UK_WASH : LAND))
      .polygonSideColor(() => "rgba(150,170,190,0.25)")
      .polygonStrokeColor(() => "rgba(120,150,180,0.3)")
      .polygonAltitude(0.006)
      .polygonsTransitionDuration(motionOk() ? 300 : 0)
      .onPolygonHover((feature) => {
        world.polygonAltitude((item) => (item === feature ? 0.02 : 0.006));
        const tip = $("hover-card");
        if (!feature) {
          tip.hidden = true;
          return;
        }
        tip.hidden = false;
        tip.textContent = countryName(feature);
      })
      .onPolygonClick((feature) => {
        skipOceanClose = true;
        const iso = feature && feature.properties ? feature.properties._iso : null;
        showCard(iso, feature ? countryName(feature) : "Country");
        const country = iso && byIso.get(iso);
        if (country) world.pointOfView({ lat: country.lat, lng: country.lng, altitude: 1.55 }, motionOk() ? 700 : 0);
        setTimeout(() => { skipOceanClose = false; }, 400);
      })
      .onGlobeClick(() => {
        if (skipOceanClose) return;
        clearCard();
      })
      .arcsData(story.arcs)
      .arcStartLat("startLat")
      .arcStartLng("startLng")
      .arcEndLat("endLat")
      .arcEndLng("endLng")
      .arcColor("color")
      .arcStroke("stroke")
      .arcAltitudeAutoScale(0.15)
      .arcDashLength("dashLength")
      .arcDashGap("dashGap")
      .arcDashAnimateTime("dashTime")
      .ringsData(story.ring ? [story.ring] : [])
      .ringLat("lat")
      .ringLng("lng")
      .ringColor("color")
      .ringMaxRadius("maxR")
      .ringPropagationSpeed("speed")
      .ringRepeatPeriod("period");

    const resize = () => {
      world.width(holder.clientWidth);
      world.height(holder.clientHeight);
    };
    resize();
    window.addEventListener("resize", resize);
    holder.addEventListener("mousemove", placeHover);
    world.onGlobeReady(() => {
      const mat = world.globeMaterial();
      if (mat) {
        if (mat.color && mat.color.set) mat.color.set("#eef5f9");
        if (mat.emissive && mat.emissive.set) {
          mat.emissive.set("#e8f1f6");
          mat.emissiveIntensity = 0.85;
        }
        if ("shininess" in mat) mat.shininess = 0;
        mat.needsUpdate = true;
      }
      const controls = world.controls();
      controls.autoRotate = false;
      controls.autoRotateSpeed = 0.35;
      world.pointOfView({ lat: 42, lng: -8, altitude: 1.85 });
      world.scene().traverse((obj) => {
        if (obj.type === "Line" || obj.type === "LineSegments") obj.raycast = () => {};
      });
      const status = $("globe-status");
      if (status.textContent === "Loading globe") status.hidden = true;
    });
  }

  function bindActions() {
    $("clear-country").addEventListener("click", clearCard);
    $("mcp-public").addEventListener("click", () => {
      log("mcp_cta", { tier: "public", country: selectedIso });
      $("mcp-result").textContent = "Simulated. A public install page would open here.";
    });
    $("mcp-private").addEventListener("click", () => {
      log("mcp_cta", { tier: "private", country: selectedIso });
      $("mcp-result").textContent = "Simulated request. Talk to Calastone: clientservices@calastone.com";
    });
    $("copy-contact").addEventListener("click", async () => {
      const text = $("contact").textContent;
      try {
        await navigator.clipboard.writeText(text);
      } catch (err) {
        const area = document.createElement("textarea");
        area.value = text;
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        area.remove();
      }
      log("question_copy", { text: text });
      $("copy-contact").textContent = "Copied";
      setTimeout(() => { $("copy-contact").textContent = "Copy"; }, 1200);
    });
    window.iscReset = () => {
      clearCard();
      $("mcp-result").textContent = "";
      if (world) world.pointOfView({ lat: 42, lng: -8, altitude: 1.85 }, motionOk() ? 600 : 0);
    };
  }

  async function init() {
    bindActions();
    try {
      const [network, flows, geo] = await Promise.all([
        fetch("/data/network/illustrative-network.json").then((r) => r.json()),
        fetch("/data/ffi/extracted/ffi.json").then((r) => r.json()),
        fetch("/assets/geo/ne_110m_admin_0_countries.geojson").then((r) => r.json())
      ]);
      net = network;
      ffi = flows;
      byIso = new Map(net.countries.map((country) => [country.iso, country]));
      $("notice").textContent = net.notice;
      bootGlobe(geo);
    } catch (err) {
      const status = $("globe-status");
      status.hidden = false;
      status.textContent = (err && err.stack) ? err.stack : String(err);
      console.error(err);
    }
  }

  init();
})();
