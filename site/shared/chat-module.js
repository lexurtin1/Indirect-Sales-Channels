(function () {
  const CONTACT = "clientservices@calastone.com";
  const CONFIG = '"calastone": {\n  "command": "calastone-mcp"\n}';
  const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

  const params = new URLSearchParams(location.search);
  const state = {
    data: null,
    brandKey: "hsbc",
    menuOpen: false,
    msgs: [],
    busy: false,
    timers: [],
    cardStep: params.get("download") === "1" ? "email" : "intro",
    email: "",
    market: params.get("market") || null,
    tier: params.get("tier") === "private" ? "private" : "public",
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

  function brand() {
    return state.data.brands[state.brandKey] || state.data.brands.hsbc;
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

  function setLogo(img, fallback, src, alt) {
    if (!img || !fallback) return;
    if (!src) {
      img.hidden = true;
      fallback.hidden = false;
      fallback.textContent = alt;
      return;
    }
    img.onload = () => {
      img.hidden = false;
      fallback.hidden = true;
    };
    img.onerror = () => {
      img.hidden = true;
      fallback.hidden = false;
      fallback.textContent = alt;
    };
    img.alt = alt;
    if (img.getAttribute("src") !== src) img.setAttribute("src", src);
    else {
      img.hidden = false;
      fallback.hidden = true;
    }
  }

  function applyBrandTheme() {
    const b = brand();
    const app = document.querySelector(".cm-app");
    if (app) {
      app.style.setProperty("--b", b.accent);
      app.style.setProperty("--bd", b.dark);
      app.style.setProperty("--bs", b.soft);
    }
    setLogo($("cm-brand-logo"), $("cm-brand-fallback"), b.logo, b.wordmark);
    $("cm-greeting").textContent = greeting() + ", " + b.first;
    $("cm-user").innerHTML =
      '<span class="cm-user-avatar">' +
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
    $("cm-recents").innerHTML = list
      .map((r) => '<div class="cm-recent">' + esc(r) + "</div>")
      .join("");
  }

  function renderBrandMenu() {
    const menu = $("cm-brand-menu");
    const order = state.data.brandOrder || Object.keys(state.data.brands);
    menu.innerHTML = order
      .map((key) => {
        const b = state.data.brands[key];
        const selected = key === state.brandKey;
        const logo = b.logo
          ? '<img src="' + esc(b.logo) + '" alt="' + esc(b.wordmark) + '">'
          : "<strong>" + esc(b.wordmark) + "</strong>";
        return (
          '<button type="button" class="cm-brand-option" role="option" data-brand="' +
          esc(key) +
          '" aria-selected="' +
          selected +
          '">' +
          logo +
          '<span class="meta"><strong>' +
          esc(b.name) +
          "</strong><span>" +
          esc(b.user) +
          "</span></span></button>"
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
    $("cm-brand-menu").hidden = true;
    $("cm-brand-btn").setAttribute("aria-expanded", "false");
    applyBrandTheme();
    renderThread();
  }

  function renderChips() {
    const b = brand();
    $("cm-chips").innerHTML = state.data.scenarios
      .map(
        (sc) =>
          '<button type="button" class="cm-chip hotspot" data-sc="' +
          esc(sc.id) +
          '">' +
          esc(sc.chip) +
          "</button>"
      )
      .join("");
    $("cm-chips").querySelectorAll("[data-sc]").forEach((btn) => {
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
    return String(text)
      .split("**")
      .map((part, i) => {
        const marked = String(part).includes("TODO")
          ? '<span class="todo-copy">' + esc(part) + "</span>"
          : esc(part);
        return i % 2 ? "<strong>" + marked + "</strong>" : marked;
      })
      .join("");
  }

  function blockHtml(blk) {
    if (blk.type === "p") return '<p class="cm-p">' + richHtml(blk.s) + "</p>";
    if (blk.type === "metrics") {
      return (
        '<div class="cm-metrics">' +
        blk.items
          .map((item) => {
            return (
              '<div class="cm-metric"><div class="label">' +
              esc(item[0]) +
              '</div><div class="value">' +
              esc(item[1]) +
              '</div><div class="delta ' +
              esc(item[3] || "flat") +
              '">' +
              esc(item[2]) +
              "</div></div>"
            );
          })
          .join("") +
        "</div>"
      );
    }
    if (blk.type === "table") {
      return (
        '<div class="cm-table-wrap"><table class="cm-table"><thead><tr>' +
        blk.head.map((h) => "<th>" + esc(h) + "</th>").join("") +
        "</tr></thead><tbody>" +
        blk.rows
          .map(
            (row) =>
              "<tr>" + row.map((cell) => "<td>" + esc(cell) + "</td>").join("") + "</tr>"
          )
          .join("") +
        "</tbody></table></div>"
      );
    }
    if (blk.type === "bars") {
      const vals = blk.bars.map((x) => x[1]);
      const mx = Math.max.apply(null, vals);
      const mn = Math.min.apply(null, vals);
      const pctScale = mx > 90;
      return (
        '<div class="cm-bars"><div class="cm-bars-title">' +
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
              '<div class="cm-bar-row"><span>' +
              esc(label) +
              '</span><div class="cm-bar-track"><div class="cm-bar-fill" style="width:' +
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
        '<div class="cm-steps">' +
        blk.steps
          .map((step) => {
            return (
              '<div class="cm-step"><div class="n">' +
              esc(step[0]) +
              "</div><strong>" +
              esc(step[1]) +
              "</strong><span>" +
              richHtml(step[2]) +
              "</span></div>"
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
      '<div class="cm-contact">Talk to Calastone: <code>' +
      CONTACT +
      '</code> <button type="button" class="cm-text-btn" data-copy-contact="1">Copy</button></div>'
    );
  }

  function renderThread() {
    const empty = $("cm-empty");
    const msgs = $("cm-msgs");
    const title = $("cm-thread-title");
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
          return '<div class="cm-bubble-user">' + esc(m.text) + "</div>";
        }
        const sc = m.scId ? state.data.scenarios.find((x) => x.id === m.scId) : null;
        const tools = sc ? fill(sc.tools, b) : [];
        const shown = tools.slice(0, m.toolsShown);
        const totalMs = shown.reduce((a, t) => a + (t.latency || 0), 0);
        const traceTitle =
          m.phase === "tools"
            ? "Calling tools"
            : tools.length
              ? tools.length + " calls · " + (totalMs / 1000).toFixed(1) + "s"
              : "Reply";

        let html = '<div class="cm-asst">';
        if (sc) {
          html +=
            '<div class="cm-trace"><button type="button" class="cm-trace-head" data-toggle-trace="' +
            esc(m.id) +
            '"><span class="cm-trace-brand"><img src="/assets/brand/calastone-wordmark-black.png" alt="Calastone"><em>MCP</em></span><span class="cm-trace-meta">' +
            esc(traceTitle) +
            '</span><span class="cm-trace-chev">' +
            (m.traceOpen ? "▴" : "▾") +
            "</span></button>";
          if (m.traceOpen) {
            html += '<div class="cm-tool-rows">';
            const rows = tools.slice(0, m.phase === "tools" ? Math.max(m.toolsShown, 1) : m.toolsShown);
            rows.forEach((t, i) => {
              const done = i < m.toolsShown;
              const mark = done
                ? t.kind === "mcp"
                  ? "done-mcp"
                  : "done-int"
                : "pending";
              const prefix = t.kind === "mcp" ? "calastone." : "internal.";
              html +=
                '<div class="cm-tool-row"><span class="cm-tool-mark ' +
                mark +
                '"></span><span class="cm-tool-name">' +
                esc(prefix + t.name) +
                "</span>" +
                (done ? '<span class="cm-tool-status">' + esc(t.status) + "</span>" : "") +
                "</div>";
            });
            html += "</div>";
          }
          html += "</div>";
        }

        if (m.phase === "writing") {
          html += '<div class="cm-writing">Writing reply…</div>';
        }

        if (m.blocksShown > 0) {
          const blocks = (m.liveBlocks || (sc ? fill(sc.blocks, b) : [])).slice(0, m.blocksShown);
          html += '<div class="cm-blocks">' + blocks.map(blockHtml).join("") + "</div>";
        }

        if (m.done) {
          if (tools.length) {
            html +=
              '<div class="cm-sources">' +
              tools
                .map((t) => {
                  return (
                    '<span class="cm-source' +
                    (t.kind === "mcp" ? " mcp" : "") +
                    '">' +
                    esc(t.name) +
                    "</span>"
                  );
                })
                .join("") +
              "</div>";
          }
          html += contactHtml();
          html += '<div class="cm-end-actions">';
          html +=
            '<button type="button" class="cm-text-btn" data-copy-msg="' +
            esc(m.id) +
            '">' +
            (m.copied ? "Copied" : "Copy") +
            "</button>";
          html +=
            '<button type="button" class="cm-text-btn" data-retry="' +
            esc(m.id) +
            '">Retry</button>';
          (sc ? sc.follow : []).forEach((f) => {
            html +=
              '<button type="button" class="cm-follow" data-follow="' +
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

    const scroller = $("cm-scroll");
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
    $("cm-question").value = "";
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
        }, i * 280);
      }
      if (!n) {
        patchMsg(id, { done: true, phase: "done", blocksShown: 0 });
        state.busy = false;
      }
    };

    const answer = () => {
      patchMsg(id, { phase: "writing" });
      if (sc) {
        later(() => finish(), 400);
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
        }, 500);
      }
    };

    if (sc) {
      const tools = fill(sc.tools, b);
      let t = 180;
      tools.forEach((tl, i) => {
        t += Math.min(tl.latency || 300, 420);
        later(() => patchMsg(id, { toolsShown: i + 1 }), t);
      });
      later(answer, t + 120);
    } else {
      later(answer, 200);
    }
  }

  function renderCapture() {
    const card = $("cm-capture-card");
    if (!card) return;
    const privateTier = state.tier === "private";
    const caps = (state.data && state.data.capabilities) || [];

    if (state.cardStep === "intro") {
      card.innerHTML =
        '<div class="cm-capture"><p class="lede">' +
        (privateTier
          ? "Request a private MCP scoped to your firm's entitlements. Simulated only."
          : "An MCP server that lets an MCP-compatible assistant read your firm's Calastone data.") +
        '</p><div class="cap-list">' +
        caps.map((c) => "<span>" + esc(c) + "</span>").join("") +
        '</div><button type="button" class="cm-btn cm-btn-ink" id="cap-to-email">' +
        (privateTier ? "Request access" : "Continue") +
        '</button><span class="cm-fine">Read-only · scoped to your entitlements</span></div>';
      $("cap-to-email").addEventListener("click", () => {
        state.cardStep = "email";
        renderCapture();
      });
      return;
    }

    if (state.cardStep === "email") {
      card.innerHTML =
        '<div class="cm-capture"><button type="button" class="back" id="cap-back">Back</button>' +
        '<p class="lede">Enter your work email to link the MCP to your firm\'s entitlements.</p>' +
        '<label>Work email<input type="email" id="cap-email" placeholder="name@yourfirm.com" value="' +
        esc(state.email) +
        '" autocomplete="email"><span class="hint" id="cap-hint"></span></label>' +
        '<button type="button" class="cm-btn cm-btn-ink" id="cap-submit">' +
        (privateTier ? "Submit request" : "Download") +
        "</button></div>";
      $("cap-hint").textContent = state.market
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
      '<div class="cm-capture"><div class="cm-setup">' +
      "<span>1. Open your client's MCP settings.</span>" +
      "<span>2. Add the server config below.</span>" +
      "<span>3. Sign in with Calastone credentials.</span>" +
      "</div><pre>" +
      esc(snippet) +
      '</pre><button type="button" class="cm-btn cm-btn-secondary" id="cap-copy">' +
      (state.copied ? "Copied" : "Copy config") +
      '</button><div class="cm-contact">Talk to Calastone: <code>' +
      CONTACT +
      '</code> <button type="button" class="cm-text-btn" id="cap-contact-copy">Copy</button></div>' +
      '<span class="cm-fine">Example query: ' +
      esc(prompt) +
      "</span></div>";
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

  function openDialog() {
    const dialog = $("cm-dialog");
    if (!dialog) return;
    renderCapture();
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function closeDialog() {
    const dialog = $("cm-dialog");
    if (!dialog) return;
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  function wire() {
    $("cm-brand-btn").addEventListener("click", () => {
      state.menuOpen = !state.menuOpen;
      $("cm-brand-menu").hidden = !state.menuOpen;
      $("cm-brand-btn").setAttribute("aria-expanded", state.menuOpen ? "true" : "false");
    });

    document.addEventListener("click", (e) => {
      if (!state.menuOpen) return;
      const wrap = document.querySelector(".cm-brand-wrap");
      if (wrap && !wrap.contains(e.target)) {
        state.menuOpen = false;
        $("cm-brand-menu").hidden = true;
        $("cm-brand-btn").setAttribute("aria-expanded", "false");
      }
    });

    $("cm-new-chat").addEventListener("click", () => {
      clearTimers();
      state.msgs = [];
      state.busy = false;
      renderThread();
    });

    $("cm-ask").addEventListener("submit", (e) => {
      e.preventDefault();
      send($("cm-question").value);
    });

    $("cm-dialog-close").addEventListener("click", closeDialog);
    $("cm-dialog").addEventListener("cancel", (e) => {
      e.preventDefault();
      closeDialog();
    });

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
    state.brandKey = "hsbc";
    state.cardStep = params.get("download") === "1" ? "email" : "intro";
    state.email = "";
    state.copied = false;
    state.market = params.get("market") || null;
    state.tier = params.get("tier") === "private" ? "private" : "public";
    closeDialog();
    applyBrandTheme();
    renderThread();
    renderCapture();
    if (params.get("download") === "1") openDialog();
  }

  window.iscReset = reset;

  function init(data) {
    state.data = data;
    wire();
    applyBrandTheme();
    renderThread();
    renderCapture();
    if (params.get("download") === "1") openDialog();
  }

  fetch("/data/chatbot/chat-scripts.json")
    .then((r) => r.json())
    .then(init)
    .catch((err) => {
      console.error(err);
      $("cm-greeting").textContent = "Could not load chat scripts.";
    });
})();
