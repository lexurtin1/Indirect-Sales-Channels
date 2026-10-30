(function () {
  const firms = ["Generic firm", "Northwind Asset Management", "Ashworth Investors", "Harbour Capital"];
  let firmIndex = 0;
  let scripts = null;
  let busy = false;
  let pendingCost = false;

  const thread = document.getElementById("thread");
  const form = document.getElementById("ask");
  const input = document.getElementById("question");
  const activity = document.getElementById("activity");
  const leads = document.getElementById("leads");
  const suggestions = document.getElementById("suggestions");
  const firmName = document.getElementById("firm-name");

  function esc(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function markTodo(text) {
    const safe = esc(text || "");
    if (String(text || "").includes("TODO")) return '<span class="todo-copy">' + safe + "</span>";
    return safe;
  }

  document.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() !== "l" || !event.shiftKey) return;
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    firmIndex = (firmIndex + 1) % firms.length;
    firmName.textContent = firms[firmIndex];
  });

  function matchTopic(question) {
    let best = null;
    let bestScore = 0;
    let tie = false;
    scripts.topics.forEach((topic) => {
      const score = topic.keywords.reduce((sum, word) => {
        return question.includes(word.toLowerCase()) ? sum + word.length : sum;
      }, 0);
      if (score > bestScore) {
        best = topic;
        bestScore = score;
        tie = false;
      } else if (score > 0 && score === bestScore) {
        tie = true;
      }
    });
    if (!best || tie || bestScore === 0) return null;
    return best;
  }

  function wantsContact(question) {
    return /contact|talk to|call me|get in touch|speak to|email me/.test(question);
  }

  function parseCost(text) {
    const nums = text.match(/\d+(?:\.\d+)?/g);
    if (!nums || nums.length < 4) return null;
    const orders = Number(nums[0]);
    let share = Number(nums[1]);
    const minutes = Number(nums[2]);
    const hourly = Number(nums[3]);
    if (share > 1) share = share / 100;
    return {
      orders: orders,
      share: share,
      minutes: minutes,
      hourly: hourly,
      annual: orders * share * (minutes / 60) * hourly * 12
    };
  }

  function addBubble(className, html) {
    const div = document.createElement("div");
    div.className = "bubble " + className;
    div.innerHTML = html;
    thread.appendChild(div);
    thread.scrollTop = thread.scrollHeight;
    return div;
  }

  function leadCard(topic, question, created) {
    const card = document.createElement("article");
    card.className = "lead" + (created ? " created" : "");
    const when = new Date().toLocaleString("en-GB", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" });
    card.innerHTML =
      "<strong>" + (created ? "Lead created" : "Lead signal") + "</strong>" +
      "Topic: " + esc(topic) + "<br>Firm: " + esc(firms[firmIndex]) +
      "<br>Question: " + esc(question) + "<br>" + esc(when);
    leads.prepend(card);
  }

  function answerHtml(topic, question) {
    if (!topic) return "<p>" + esc(scripts.fallback.answer) + "</p>";
    const answer = topic.answer;
    if (topic.id === "cost") {
      const parsed = parseCost(question);
      if (!parsed) {
        return '<div class="tool">Calastone MCP: cost_calculator called</div>' +
          "<p>" + markTodo(answer.problem) + "</p>" +
          "<p>" + markTodo(answer.solution) + "</p>" +
          "<p>Use four numbers, in this order: monthly orders, manual share, minutes per manual order, hourly cost.</p>";
      }
      return '<div class="tool">Calastone MCP: cost_calculator called</div>' +
        "<p>" + esc(answer.proof.text) + " " + parsed.orders.toLocaleString("en-GB") +
        " orders a month, " + Math.round(parsed.share * 100) + "% manual, " + parsed.minutes +
        " minutes each, at " + parsed.hourly + " an hour.</p>" +
        "<p>Estimated annual saving: " + Math.round(parsed.annual).toLocaleString("en-GB") + ".</p>" +
        '<p>' + esc(answer.cta) + ' <button type="button" class="copy-btn" data-copy="' + esc(scripts.contact) + '">Copy</button></p>';
    }
    let solution = answer.solution;
    if (topic.id === "isin") {
      const found = question.toUpperCase().match(/\b[A-Z]{2}[A-Z0-9]{10}\b/);
      const isin = found ? found[0] : "LU0000000001";
      solution = "Simulated result: " + isin + " is not yet connected. Calastone has logged the request so the fund manager can be contacted.";
    }
    return '<div class="tool">Calastone MCP: ' + esc(topic.tool) + " called</div>" +
      "<p>" + markTodo(answer.problem) + "</p>" +
      "<p>" + markTodo(solution) + "</p>" +
      "<p>Proof: " + markTodo(answer.proof.text) + (answer.proof.source ? " (" + markTodo(answer.proof.source) + ")" : "") + "</p>" +
      '<p>' + esc(answer.cta) + ' <button type="button" class="copy-btn" data-copy="' + esc(scripts.contact) + '">Copy</button></p>';
  }

  async function respond(question) {
    if (busy || !scripts) return;
    busy = true;
    input.disabled = true;
    const lower = question.toLowerCase();
    addBubble("user", esc(question));
    const wait = addBubble("bot", "Calling Calastone MCP");
    await new Promise((resolve) => setTimeout(resolve, 600 + Math.floor(Math.random() * 301)));
    let topic = matchTopic(lower);
    if (pendingCost && parseCost(lower)) topic = scripts.topics.find((item) => item.id === "cost");
    pendingCost = !!(topic && topic.id === "cost" && !parseCost(lower));
    const tool = topic ? topic.tool : scripts.fallback.tool;
    wait.innerHTML = answerHtml(topic, lower);
    const item = document.createElement("li");
    item.textContent = "Calastone MCP: " + tool + " called";
    activity.prepend(item);
    leadCard(topic ? topic.label : "Unanswered", question, wantsContact(lower));
    wait.querySelectorAll("[data-copy]").forEach((button) => {
      button.addEventListener("click", async () => {
        const text = scripts.contact;
        try { await navigator.clipboard.writeText(text); }
        catch (err) {
          const area = document.createElement("textarea");
          area.value = text;
          document.body.appendChild(area);
          area.select();
          document.execCommand("copy");
          area.remove();
        }
        button.textContent = "Copied";
      });
    });
    input.disabled = false;
    busy = false;
    input.focus();
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question) return;
    input.value = "";
    respond(question);
  });

  document.getElementById("request-contact").addEventListener("click", () => {
    respond("Please contact me about this.");
  });

  window.iscReset = () => {
    thread.innerHTML = "";
    activity.innerHTML = "";
    leads.innerHTML = "";
    pendingCost = false;
    firmIndex = 0;
    firmName.textContent = firms[0];
    input.value = "";
    busy = false;
    input.disabled = false;
  };

  fetch("/data/chatbot/scripts.json")
    .then((response) => response.json())
    .then((data) => {
      scripts = data;
      data.topics.forEach((topic) => {
        const label = document.createElement("div");
        label.className = "group-label";
        label.textContent = topic.label;
        suggestions.appendChild(label);
        topic.suggested_questions.forEach((q) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "hotspot";
          button.textContent = q;
          button.addEventListener("click", () => respond(q));
          suggestions.appendChild(button);
        });
      });
    })
    .catch(() => {
      addBubble("bot", "The answer file did not load.");
    });
})();
