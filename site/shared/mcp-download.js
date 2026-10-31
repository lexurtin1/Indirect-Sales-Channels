(function () {
  const CONTACT = "clientservices@calastone.com";
  const CONFIG = '"calastone": {\n  "command": "calastone-mcp"\n}';
  const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

  const params = new URLSearchParams(location.search);
  const state = {
    data: null,
    brandKey: "northwind",
    menuOpen: false,
    msgs: [],
    busy: false,
    timers: [],
    cardStep: "intro",
    email: "",
    market: params.get("market") || null,
    tier: params.get("tier") === "private" ? "private" : "public",
    copied: false,
    contactCopied: false,
    drawerOpen: false
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

  function brand() {
    return state.data.brands[state.brandKey] || state.data.brands.northwind;
  }

  function fill(template, b) {
    if (template == null) return template;
    if (typeof template === "number" || typeof template === "boolean") return template;
    if (Array.isArray(template)) return template.map((x) => fill(x, b));
    if (typeof template === "object") {
      const out = {};
      Object.keys(template).forEach((k) => {
        out[k] = fill(template[k], b);
      });
      return out;
    }
    return String(template)
      .replace(/\{\{fundShort\}\}/g, b.fundShort)
      .replace(/\{\{fund\}\}/g, b.fund)
      .replace(/\{\{isin\}\}/g, b.isin)
      .replace(/\{\{ac\}\}/g, b.ac)
      .replace(/\{\{dist0\}\}/g, b.dist[0])
      .replace(/\{\{dist1\}\}/g, b.dist[1])
      .replace(/\{\{dist2\}\}/g, b.dist[2])
      .replace(/\{\{dist3\}\}/g, b.dist[3])
      .replace(/\{\{dist4\}\}/g, b.dist[4])
      .replace(/\{\{name\}\}/g, b.name)
      .replace(/\{\{user\}\}/g, b.user);
  }

  function clearTimers() {
    state.timers.forEach(clearTimeout);
    state.timers = [];
  }

  function later(fn, ms) {
    const delay = motionOk() ? ms : Math.min(ms, 40);
    state.timers.push(setTimeout(fn, delay));
  }

  function greeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }

  function applyBrandTheme() {
    const b = brand();
    const chat = document.querySelector(".md-chat");
    if (chat) {
      chat.style.setProperty("--b", b.accent);
      chat.style.setProperty("--bd", b.dark);
      chat.style.setProperty("--bs", b.soft);
    }
    $("md-brand-mark").textContent = b.mono;
    $("md-brand-name").textContent = b.short;
    $("md-greet-mark").textContent = b.mono;
    $("md-greeting").textContent = greeting() + ", " + b.first;
    $("md-user").innerHTML =
      '<span class="md-user-avatar">' +
      esc(b.initials) +
      "</span><span><strong>" +
      esc(b.user) +
      "</strong><span>" +
      esc(b.role) +
      "</span></span>";
    renderRecents();
    renderBrandMenu();
    renderChips();
  }

  function renderRecents() {
    const list = (state.data.recents && state.data.recents[state.brandKey]) || [];
    $("md-recents").innerHTML = list
      .map((r) => '<div class="md-recent">' + esc(r) + "</div>")
      .join("");
  }

  function renderBrandMenu() {
    const menu = $("md-brand-menu");
    const order = state.data.brandOrder || Object.keys(state.data.brands);
    menu.innerHTML = order
      .map((key) => {
        const b = state.data.brands[key];
        const selected = key === state.brandKey;
        return (
          '<button type="button" class="md-brand-option" role="option" data-brand="' +
          esc(key) +
          '" aria-selected="' +
          selected +
          '">' +
          '<span class="md-brand-swatch" style="background:' +
          esc(b.accent) +
          '"></span>' +
          "<span><strong>" +
          esc(b.name) +
          "</strong><span>" +
          esc(b.user) +
          "</span></span>" +
          "</button>"
        );
      })
      .join("");
    menu.querySelectorAll("[data-brand]").forEach((btn) => {
      btn.addEventListener("click", () => setBrand(btn.dataset.brand));
    });
  }

  function setBrand(key) {
    if (!state.data.brands[key]) return;
    clearTimers();
    state.brandKey = key;
    state.menuOpen = false;
    state.msgs = [];
    state.busy = false;
    $("md-brand-menu").hidden = true;
    $("md-brand-btn").setAttribute("aria-expanded", "false");
    applyBrandTheme();
    renderThread();
  }

  function renderChips() {
    const b = brand();
    $("md-chips").innerHTML = state.data.scenarios
      .map((sc) => {
        return (
          '<button type="button" class="md-chip hotspot" data-sc="' +
          esc(sc.id) +
          '">' +
          esc(sc.chip) +
          "</button>"
        );
      })
      .join("");
    $("md-chips").querySelectorAll("[data-sc]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const sc = state.data.scenarios.find((x) => x.id === btn.dataset.sc);
        if (!sc) return;
        send(fill(sc.prompt, b), sc.id);
      });
    });
  }

  function matchScenario(question) {
    const q = question.toLowerCase();
    let best = null;
    let bestScore = 0;
    let tie = false;
    state.data.scenarios.forEach((sc) => {
      const score = (sc.keywords || []).reduce((sum, word) => {
        return q.includes(String(word).toLowerCase()) ? sum + String(word).length : sum;
      }, 0);
      if (score > bestScore) {
        best = sc;
        bestScore = score;
        tie = false;
      } else if (score > 0 && score === bestScore) {
        tie = true;
      }
    });
    if (!best || tie || bestScore === 0) return null;
    return best;
  }

  function richHtml(text) {
    const parts = String(text).split("**");
    return parts
      .map((part, i) => {
        const marked = String(part).includes("TODO")
          ? '<span class="todo-copy">' + esc(part) + "</span>"
          : esc(part);
        return i % 2 ? "<strong>" + marked + "</strong>" : marked;
      })
      .join("");
  }

  function cellHtml(value) {
    let s = String(value);
    let cls = "";
    if (s.charAt(0) === "✓") {
      cls = "md-cell-good";
      s = s.slice(1);
    } else if (s.charAt(0) === "!") {
      cls = "md-cell-bad";
      s = s.slice(1);
    } else if (s.charAt(0) === "~") {
      cls = "md-cell-warn";
      s = s.slice(1);
    }
    return '<td class="' + cls + '">' + esc(s) + "</td>";
  }

  function blockHtml(blk) {
    if (blk.type === "p") return '<div class="md-p">' + richHtml(blk.s) + "</div>";
    if (blk.type === "metrics") {
      return (
        '<div class="md-metrics">' +
        blk.items
          .map((item) => {
            const label = item[0];
            const value = item[1];
            const delta = item[2];
            const tone = item[3] || "flat";
            return (
              '<div class="md-metric"><div class="label">' +
              esc(label) +
              '</div><div class="value">' +
              esc(value) +
              '</div><div class="delta ' +
              esc(tone) +
              '">' +
              esc(delta) +
              "</div></div>"
            );
          })
          .join("") +
        "</div>"
      );
    }
    if (blk.type === "table") {
      return (
        '<table class="md-table"><thead><tr>' +
        blk.head.map((h) => "<th>" + esc(h) + "</th>").join("") +
        "</tr></thead><tbody>" +
        blk.rows
          .map((row) => "<tr>" + row.map(cellHtml).join("") + "</tr>")
          .join("") +
        "</tbody></table>"
      );
    }
    if (blk.type === "bars") {
      const vals = blk.bars.map((x) => x[1]);
      const mx = Math.max.apply(null, vals);
      const mn = Math.min.apply(null, vals);
      const pctScale = mx > 90;
      return (
        '<div class="md-bars"><div class="md-bars-title">' +
        esc(blk.title) +
        "</div>" +
        blk.bars
          .map((pair) => {
            const label = pair[0];
            const v = pair[1];
            let pct;
            if (pctScale) pct = 20 + (80 * (v - mn + 0.5)) / (mx - mn + 0.5);
            else if (String(blk.title).indexOf("FFI") === 0) pct = (100 * (v - 45)) / (mx - 45);
            else pct = (100 * v) / mx;
            const display = String(v) + (pctScale ? "%" : "");
            return (
              '<div class="md-bar-row"><span>' +
              esc(label) +
              '</span><div class="md-bar-track"><div class="md-bar-fill' +
              (v === mx ? " max" : "") +
              '" style="width:' +
              pct +
              '%"></div></div><span>' +
              esc(display) +
              "</span></div>"
            );
          })
          .join("") +
        "</div>"
      );
    }
    if (blk.type === "steps") {
      return (
        '<div class="md-steps">' +
        blk.steps
          .map((step) => {
            return (
              '<div class="md-step"><div class="md-step-n">' +
              esc(step[0]) +
              "</div><div><strong>" +
              esc(step[1]) +
              "</strong><span>" +
              richHtml(step[2]) +
              "</span></div></div>"
            );
          })
          .join("") +
        "</div>"
      );
    }
    return "";
  }

  function contactHtml() {
    return (
      '<div class="md-contact">Talk to Calastone: <code>' +
      CONTACT +
      '</code> <button type="button" class="md-copy-btn" data-copy-contact="1">Copy</button></div>'
    );
  }

  function renderThread() {
    const empty = $("md-empty");
    const msgs = $("md-msgs");
    const title = $("md-thread-title");
    const firstUser = state.msgs.find((m) => m.role === "user");
    title.textContent = firstUser ? firstUser.text : "";

    if (!state.msgs.length) {
      empty.hidden = false;
      msgs.hidden = true;
      msgs.innerHTML = "";
      return;
    }

    empty.hidden = true;
    msgs.hidden = false;
    const b = brand();
    msgs.innerHTML = state.msgs
      .map((m) => {
        if (m.role === "user") {
          return '<div class="md-bubble-user">' + esc(m.text) + "</div>";
        }
        const sc = m.scId ? state.data.scenarios.find((x) => x.id === m.scId) : null;
        const tools = sc ? fill(sc.tools, b) : [];
        const shownCount = m.phase === "tools" ? m.toolsShown : m.toolsShown;
        const shown = tools.slice(0, shownCount);
        const running = m.phase === "tools" && shownCount < tools.length;
        const totalMs = shown.reduce((a, t) => a + (t.latency || 0), 0);
        const traceTitle =
          m.phase === "tools"
            ? "Querying"
            : tools.length
              ? tools.length + " calls · " + (totalMs / 1000).toFixed(1) + "s"
              : "Reply";

        let html = '<div class="md-asst" data-msg="' + esc(m.id) + '">';
        if (sc) {
          html +=
            '<div class="md-trace"><button type="button" class="md-trace-head" data-toggle-trace="' +
            esc(m.id) +
            '">' +
            '<img class="md-trace-logo" src="/assets/brand/calastone-wordmark-black.png" alt="Calastone">' +
            '<span class="md-trace-label">MCP</span>' +
            '<span class="md-trace-meta">' +
            esc(traceTitle) +
            "</span><span>" +
            (m.traceOpen ? "▴" : "▾") +
            "</span></button>";
          if (m.traceOpen) {
            html += '<div class="md-tool-rows">';
            tools.slice(0, m.phase === "tools" ? m.toolsShown + 1 : m.toolsShown).forEach((t, i) => {
              const done = i < m.toolsShown;
              const prefix = t.kind === "mcp" ? "calastone." : "internal.";
              html +=
                '<div class="md-tool-row"><span class="md-tool-dot ' +
                (done ? (t.kind === "mcp" ? "" : "int") : "run") +
                '"></span><span>' +
                esc(prefix + t.name) +
                "</span>" +
                (done ? '<span class="md-tool-status">' + esc(t.status) + "</span>" : "") +
                "</div>";
            });
            html += "</div>";
          }
          html += "</div>";
        }

        if (m.phase === "writing") {
          html += '<div class="md-writing" aria-hidden="true"><span></span><span></span><span></span></div>';
        }

        if (m.blocksShown > 0) {
          const blocks = (m.liveBlocks || (sc ? fill(sc.blocks, b) : [])).slice(0, m.blocksShown);
          html += '<div class="md-blocks">' + blocks.map(blockHtml).join("") + "</div>";
        }

        if (m.done) {
          if (tools.length) {
            html +=
              '<div class="md-sources">' +
              tools
                .map((t) => {
                  return (
                    '<span class="md-source' +
                    (t.kind === "mcp" ? "" : " int") +
                    '">' +
                    esc(t.name) +
                    "</span>"
                  );
                })
                .join("") +
              "</div>";
          }
          html += contactHtml();
          html += '<div class="md-end-actions">';
          html +=
            '<button type="button" class="md-copy-btn" data-copy-msg="' +
            esc(m.id) +
            '">' +
            (m.copied ? "Copied" : "Copy") +
            "</button>";
          html +=
            '<button type="button" class="md-retry-btn" data-retry="' +
            esc(m.id) +
            '">Retry</button>';
          (sc ? sc.follow : []).forEach((f) => {
            html +=
              '<button type="button" class="md-follow" data-follow="' +
              esc(f) +
              '">' +
              esc(f) +
              "</button>";
          });
          html += "</div>";
        }

        html += "</div>";
        return html;
      })
      .join("");

    msgs.querySelectorAll("[data-toggle-trace]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const msg = state.msgs.find((m) => m.id === btn.dataset.toggleTrace);
        if (!msg) return;
        msg.traceOpen = !msg.traceOpen;
        renderThread();
      });
    });
    msgs.querySelectorAll("[data-copy-msg]").forEach((btn) => {
      btn.addEventListener("click", () => copyAnswer(btn.dataset.copyMsg));
    });
    msgs.querySelectorAll("[data-retry]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const msg = state.msgs.find((m) => m.id === btn.dataset.retry);
        if (!msg) return;
        send(msg.q, msg.scId);
      });
    });
    msgs.querySelectorAll("[data-follow]").forEach((btn) => {
      btn.addEventListener("click", () => send(btn.dataset.follow));
    });
    msgs.querySelectorAll("[data-copy-contact]").forEach((btn) => {
      btn.addEventListener("click", () => copyText(CONTACT, btn));
    });

    const scroller = $("md-scroll");
    requestAnimationFrame(() => {
      scroller.scrollTop = scroller.scrollHeight;
    });
  }

  function patchMsg(id, patch) {
    const msg = state.msgs.find((m) => m.id === id);
    if (!msg) return;
    Object.assign(msg, typeof patch === "function" ? patch(msg) : patch);
    renderThread();
  }

  function copyText(text, btn) {
    const done = () => {
      if (!btn) return;
      const prev = btn.textContent;
      btn.textContent = "Copied";
      setTimeout(() => {
        btn.textContent = prev;
      }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(done);
    } else {
      done();
    }
  }

  function copyAnswer(id) {
    const msg = state.msgs.find((m) => m.id === id);
    if (!msg) return;
    const b = brand();
    const sc = msg.scId ? state.data.scenarios.find((x) => x.id === msg.scId) : null;
    const blocks = msg.liveBlocks || (sc ? fill(sc.blocks, b) : []);
    const text = blocks
      .filter((x) => x.type === "p")
      .map((x) => String(x.s).replace(/\*\*/g, ""))
      .join("\n\n");
    copyText(text + "\n\nTalk to Calastone: " + CONTACT);
    msg.copied = true;
    renderThread();
    later(() => {
      msg.copied = false;
      renderThread();
    }, 1600);
  }

  function send(text, scId) {
    text = String(text || "").trim();
    if (!text || state.busy) return;
    const b = brand();
    const sc = scId
      ? state.data.scenarios.find((x) => x.id === scId)
      : matchScenario(text);
    const id = String(Date.now()) + Math.random().toString(16).slice(2);
    state.busy = true;
    $("md-question").value = "";
    state.msgs.push({ id: id + "u", role: "user", text: text });
    state.msgs.push({
      id: id,
      role: "asst",
      q: text,
      scId: sc ? sc.id : null,
      toolsShown: 0,
      blocksShown: 0,
      phase: sc ? "tools" : "writing",
      done: false,
      traceOpen: true,
      liveBlocks: null,
      copied: false
    });
    renderThread();

    const finish = (blocks) => {
      patchMsg(id, { phase: "blocks", liveBlocks: blocks || null });
      const n = (blocks || (sc ? fill(sc.blocks, b) : [])).length;
      for (let i = 1; i <= n; i++) {
        later(() => {
          patchMsg(id, {
            blocksShown: i,
            ...(i === n ? { done: true, phase: "done", traceOpen: false } : {})
          });
          if (i === n) state.busy = false;
        }, i * 420);
      }
      if (!n) {
        patchMsg(id, { done: true, phase: "done", blocksShown: 0 });
        state.busy = false;
      }
    };

    const answer = () => {
      patchMsg(id, { phase: "writing" });
      if (sc) {
        later(() => finish(), 650);
      } else {
        later(() => {
          finish([
            {
              type: "p",
              s:
                (state.data.fallback && state.data.fallback.text) ||
                "I can help with that. Talk to Calastone: clientservices@calastone.com"
            }
          ]);
        }, 900);
      }
    };

    if (sc) {
      const tools = fill(sc.tools, b);
      let t = 300;
      tools.forEach((tl, i) => {
        t += tl.latency || 400;
        later(() => patchMsg(id, { toolsShown: i + 1 }), t);
      });
      later(answer, t + 200);
    } else {
      later(answer, 300);
    }
  }

  function openCaptureDrawer(force) {
    if (window.matchMedia("(max-width: 980px)").matches || force === "drawer") {
      state.drawerOpen = true;
      document.body.classList.add("md-capture-open");
      $("md-drawer-backdrop").hidden = false;
      $("md-capture-close").hidden = false;
    }
  }

  function closeCaptureDrawer() {
    state.drawerOpen = false;
    document.body.classList.remove("md-capture-open");
    $("md-drawer-backdrop").hidden = true;
  }

  function renderCapture() {
    const card = $("md-capture-card");
    const privateTier = state.tier === "private";
    const caps = (state.data && state.data.capabilities) || [
      "Query orders and flows",
      "Create custom reports",
      "Review ISIN checks",
      "Review market coverage"
    ];

    if (state.cardStep === "intro") {
      card.innerHTML =
        '<span class="eyebrow">Calastone MCP</span>' +
        "<div><h2>" +
        (privateTier
          ? "Request a private MCP for your firm."
          : "Connect your AI assistant to your Calastone data.") +
        "</h2>" +
        '<p class="lede">' +
        (privateTier
          ? "A private MCP server scoped to your entitlements. Simulated request only."
          : "An MCP server that lets any MCP-compatible assistant read your firm's Calastone data.") +
        "</p></div>" +
        '<div class="md-cap-list">' +
        caps.map((c) => "<span>" + esc(c) + "</span>").join("") +
        "</div>" +
        '<button type="button" class="md-btn md-btn-ink hotspot" id="cap-to-email">' +
        (privateTier ? "Request access" : "Download") +
        "</button>" +
        '<span class="md-fine">Read-only · scoped to your entitlements</span>';
      $("cap-to-email").addEventListener("click", () => {
        state.cardStep = "email";
        renderCapture();
      });
      return;
    }

    if (state.cardStep === "email") {
      card.innerHTML =
        '<button type="button" class="md-back" id="cap-back">← Back</button>' +
        '<span class="eyebrow">Step 1 of 2</span>' +
        '<p class="lede">Enter your work email. It is used to link the MCP to your firm\'s entitlements.</p>' +
        '<label>Work email<input type="email" id="cap-email" placeholder="name@yourfirm.com" value="' +
        esc(state.email) +
        '" autocomplete="email"><span class="md-hint" id="cap-hint"></span></label>' +
        '<button type="button" class="md-btn md-btn-ink" id="cap-submit">' +
        (privateTier ? "Submit request" : "Download") +
        "</button>";
      const hint = $("cap-hint");
      hint.textContent = state.market
        ? "Market selected: " + state.market
        : "Business address required";
      const input = $("cap-email");
      const submit = $("cap-submit");
      submit.disabled = !EMAIL_RE.test(state.email);
      input.addEventListener("input", () => {
        state.email = input.value;
        submit.disabled = !EMAIL_RE.test(state.email);
      });
      $("cap-back").addEventListener("click", () => {
        state.cardStep = "intro";
        renderCapture();
      });
      submit.addEventListener("click", () => {
        if (!EMAIL_RE.test(state.email)) return;
        state.cardStep = "done";
        state.copied = false;
        renderCapture();
      });
      input.focus();
      return;
    }

    const prompt = state.market
      ? "order volume by distributor in " + state.market + ", Q3 2025."
      : "net flows by distributor, last month.";
    const snippet = (state.data && state.data.configSnippet) || CONFIG;
    card.innerHTML =
      '<span class="eyebrow done">Step 2 of 2 · ' +
      (privateTier ? "Requested" : "Downloaded") +
      "</span>" +
      '<div class="md-setup">' +
      "<span>1. Open your client's MCP settings.</span>" +
      "<span>2. Add the server config below.</span>" +
      "<span>3. Sign in with Calastone credentials.</span>" +
      "</div>" +
      "<pre>" +
      esc(snippet) +
      "</pre>" +
      '<button type="button" class="md-btn md-btn-secondary" id="cap-copy">' +
      (state.copied ? "Copied" : "Copy config") +
      "</button>" +
      '<div class="md-contact">Talk to Calastone: <code>' +
      CONTACT +
      '</code> <button type="button" class="md-copy-btn" id="cap-contact-copy">Copy</button></div>' +
      '<span class="md-fine">Example query: ' +
      esc(prompt) +
      "</span>";
    $("cap-copy").addEventListener("click", () => {
      copyText(snippet, $("cap-copy"));
      state.copied = true;
      later(() => {
        state.copied = false;
        if (state.cardStep === "done") renderCapture();
      }, 1600);
    });
    $("cap-contact-copy").addEventListener("click", () => copyText(CONTACT, $("cap-contact-copy")));
  }

  function wire() {
    $("md-brand-btn").addEventListener("click", () => {
      state.menuOpen = !state.menuOpen;
      $("md-brand-menu").hidden = !state.menuOpen;
      $("md-brand-btn").setAttribute("aria-expanded", state.menuOpen ? "true" : "false");
    });

    document.addEventListener("click", (e) => {
      if (!state.menuOpen) return;
      const wrap = document.querySelector(".md-brand-wrap");
      if (wrap && !wrap.contains(e.target)) {
        state.menuOpen = false;
        $("md-brand-menu").hidden = true;
        $("md-brand-btn").setAttribute("aria-expanded", "false");
      }
    });

    $("md-new-chat").addEventListener("click", () => {
      clearTimers();
      state.msgs = [];
      state.busy = false;
      renderThread();
    });

    $("md-ask").addEventListener("submit", (e) => {
      e.preventDefault();
      send($("md-question").value);
    });

    $("md-open-capture").addEventListener("click", () => {
      openCaptureDrawer("drawer");
      $("md-capture-card").scrollIntoView({ block: "nearest", behavior: motionOk() ? "smooth" : "auto" });
    });

    $("md-capture-close").addEventListener("click", closeCaptureDrawer);
    $("md-drawer-backdrop").addEventListener("click", closeCaptureDrawer);

    document.addEventListener("keydown", (event) => {
      if (event.key.toLowerCase() !== "l" || !event.shiftKey) return;
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const order = state.data.brandOrder || Object.keys(state.data.brands);
      const i = order.indexOf(state.brandKey);
      setBrand(order[(i + 1) % order.length]);
    });
  }

  function reset() {
    clearTimers();
    state.msgs = [];
    state.busy = false;
    state.brandKey = "northwind";
    state.cardStep = params.get("download") === "1" ? "email" : "intro";
    state.email = "";
    state.copied = false;
    state.market = params.get("market") || null;
    state.tier = params.get("tier") === "private" ? "private" : "public";
    closeCaptureDrawer();
    applyBrandTheme();
    renderThread();
    renderCapture();
    if (params.get("download") === "1") openCaptureDrawer("drawer");
  }

  window.iscReset = reset;

  function init(data) {
    state.data = data;
    wire();
    if (params.get("download") === "1") {
      state.cardStep = "email";
    }
    applyBrandTheme();
    renderThread();
    renderCapture();
    if (params.get("download") === "1") openCaptureDrawer("drawer");
  }

  fetch("/data/chatbot/mcp-download-scripts.json")
    .then((r) => r.json())
    .then(init)
    .catch((err) => {
      console.error(err);
      const card = $("md-capture-card");
      if (card) {
        card.innerHTML =
          '<p class="lede">Could not load the demo scripts. Check /data/chatbot/mcp-download-scripts.json.</p>';
      }
    });
})();
