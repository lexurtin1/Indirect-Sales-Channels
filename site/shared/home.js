(function () {
  const dateline = document.getElementById("greeting-date");
  if (dateline) {
    const now = new Date();
    const hour = now.getHours();
    const part = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    const date = now.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    dateline.textContent = part + " · " + date;
  }

  const search = document.getElementById("search");
  const cards = Array.from(document.querySelectorAll(".tool-card"));
  const empty = document.getElementById("empty");
  if (search && cards.length) {
    const params = new URLSearchParams(location.search);
    if (params.get("q")) search.value = params.get("q");
    const filter = () => {
      const q = search.value.trim().toLowerCase();
      let shown = 0;
      cards.forEach((card) => {
        const match = !q || card.innerText.toLowerCase().includes(q);
        card.hidden = !match;
        if (match) shown += 1;
      });
      if (empty) empty.hidden = shown !== 0;
    };
    search.addEventListener("input", filter);
    filter();
  }

  const navSearch = document.getElementById("nav-search");
  if (navSearch) {
    navSearch.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      const q = navSearch.value.trim();
      location.href = q ? "/?q=" + encodeURIComponent(q) : "/";
    });
  }

  const canvas = document.getElementById("ph-ecg");
  if (!canvas) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const norm = [
    [0, 0.5], [0.09, 0.5], [0.14, 0.44], [0.19, 0.5], [0.22, 0.54],
    [0.27, 0.08], [0.34, 0.75], [0.4, 0.5], [0.46, 0.39], [0.52, 0.5], [1, 0.5]
  ];
  const ctx = canvas.getContext("2d");
  const pad = 2;
  const pts = norm.map(([x, y]) => [pad + x * (canvas.width - 2 * pad), pad + y * (canvas.height - 2 * pad)]);
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i][0] - pts[i - 1][0];
    const dy = pts[i][1] - pts[i - 1][1];
    cum.push(cum[i - 1] + Math.sqrt(dx * dx + dy * dy));
  }
  const length = cum[cum.length - 1];

  function pointAt(distance) {
    const d = ((distance % length) + length) % length;
    for (let i = 1; i < pts.length; i++) {
      if (cum[i] >= d) {
        const span = cum[i] - cum[i - 1];
        const t = span > 0 ? (d - cum[i - 1]) / span : 0;
        return [pts[i - 1][0] + t * (pts[i][0] - pts[i - 1][0]), pts[i - 1][1] + t * (pts[i][1] - pts[i - 1][1])];
      }
    }
    return pts[pts.length - 1];
  }

  function ghost() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    pts.slice(1).forEach((p) => ctx.lineTo(p[0], p[1]));
    ctx.strokeStyle = "rgba(45,154,142,0.45)";
    ctx.lineWidth = 1.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  }

  if (reduce) {
    ghost();
    return;
  }

  const trail = length * 0.4;
  const speed = length / 2200;
  let phase = 0;
  let last = null;

  function frame(ts) {
    requestAnimationFrame(frame);
    if (last == null) last = ts;
    const dt = Math.min(ts - last, 50);
    last = ts;
    const along = (phase % length) / length;
    const bell = Math.exp(-Math.pow((along - 0.44) / 0.22, 2));
    phase += dt * speed * (0.55 + 4.5 * bell);
    const pos = phase % length;
    ghost();
    const steps = 60;
    for (let i = 1; i <= steps; i++) {
      const a = (i - 1) / steps;
      const b = i / steps;
      const d0 = pos - trail + a * trail;
      const d1 = pos - trail + b * trail;
      const n0 = ((d0 % length) + length) % length;
      const n1 = ((d1 % length) + length) % length;
      if (n1 < n0 - 1) continue;
      const p0 = pointAt(d0);
      const p1 = pointAt(d1);
      ctx.beginPath();
      ctx.moveTo(p0[0], p0[1]);
      ctx.lineTo(p1[0], p1[1]);
      ctx.strokeStyle = "rgba(" + Math.round(45 + 8 * b) + "," + Math.round(154 + 27 * b) + "," + Math.round(142 - 16 * b) + "," + (a * 0.95) + ")";
      ctx.lineWidth = 1.8;
      ctx.lineCap = "round";
      ctx.stroke();
    }
  }
  requestAnimationFrame(frame);
})();
