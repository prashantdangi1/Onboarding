// Hack Pulse — onboarding state machine
const STEPS = ["welcome", "class", "oath", "arsenal", "handle", "domains", "granted"];
const NUMBERED = ["class", "oath", "arsenal", "handle", "domains", "granted"];
const XP_PER_STEP = { class: 100, oath: 175, arsenal: 150, handle: 125, domains: 200, enter: 250 };

const state = {
  idx: 0,
  xp: 0,
  selectedClass: null,
  oathAccepted: false,
  arsenalSeen: new Set(),
  handle: "",
  domains: new Set(),
};

const CLASSES = [
  {
    id: "rookie",
    title: "The Rookie",
    kicker: "day_one // fundamentals",
    desc: "New to the field. You want the map, the tools, and your first flag.",
    icon: iconTerminal(),
  },
  {
    id: "operator",
    title: "The Operator",
    kicker: "ctf // practice",
    desc: "Student or CTF grinder. You ship writeups and sharpen your edge weekly.",
    icon: iconFlag(),
  },
  {
    id: "ghost",
    title: "The Ghost",
    kicker: "pro // offensive_ops",
    desc: "Pro red teamer, researcher, bounty hunter. You trade intel and burn zero-days.",
    icon: iconGhost(),
  },
];

const ARSENAL = [
  { id: "feed", title: "The Feed", kicker: "daily_intel", desc: "Breaking CVEs, leaks, and the pulse of the underground — curated hourly.", icon: iconRss() },
  { id: "arena", title: "The Arena", kicker: "ctf_challenges", desc: "Weekly CTFs, rooms, and live hack-alongs. Ranked leaderboard resets monthly.", icon: iconFlag() },
  { id: "armory", title: "The Armory", kicker: "tools_and_wordlists", desc: "Curated payloads, scripts, dotfiles, and battle-tested lab setups.", icon: iconWrench() },
  { id: "warroom", title: "The War Room", kicker: "live_sessions", desc: "Live breakdowns on Tuesday & Thursday, 9PM IST. Audits, walkthroughs, Q&A.", icon: iconRadio() },
  { id: "intel", title: "Intel Desk", kicker: "osint_and_recon", desc: "OSINT investigations, threat intel drops, and deep-dive reports.", icon: iconEye() },
  { id: "bounty", title: "Bounty Board", kicker: "gigs_and_bugs", desc: "Vetted bug bounty leads, cleared gigs, and vetted hiring from the community.", icon: iconTarget() },
];

const DOMAINS = [
  "Web Exploitation", "Binary Exploitation", "Reverse Engineering", "Cryptography",
  "OSINT", "Malware Analysis", "Network Security", "Cloud Security",
  "Mobile / Android", "iOS", "Hardware / IoT", "AppSec / SAST",
  "Blue Team / DFIR", "Threat Intel", "AI / LLM Security", "Privacy & Anon",
];

const app = document.getElementById("app");
const topbar = document.getElementById("topbar");
const backBtn = document.getElementById("backBtn");
const xpValEl = document.getElementById("xpVal");
const crumbEl = document.getElementById("crumb");

backBtn.addEventListener("click", goBack);
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    const primary = document.querySelector(".btn.primary:not(:disabled)");
    if (primary && document.activeElement.tagName !== "INPUT") primary.click();
  } else if (e.key === "Escape") {
    if (state.idx > 0) goBack();
  }
});

render();
initMatrix();
initSysBar();

function render() {
  const step = STEPS[state.idx];
  updateChrome(step);
  app.innerHTML = "";
  const el = document.createElement("section");
  el.className = "screen";
  el.innerHTML = viewFor(step);
  app.appendChild(el);
  bindFor(step);
}

function updateChrome(step) {
  if (step === "welcome") {
    topbar.hidden = true;
  } else {
    topbar.hidden = false;
    const n = NUMBERED.indexOf(step) + 1;
    crumbEl.textContent = `step_${String(n).padStart(2, "0")}_of_06`;
  }
  animateXP(state.xp);
}

function animateXP(target) {
  const current = parseInt(xpValEl.textContent, 10) || 0;
  if (current === target) return;
  const delta = target - current;
  const duration = 500;
  const start = performance.now();
  function tick(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    xpValEl.textContent = Math.round(current + delta * eased);
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function viewFor(step) {
  switch (step) {
    case "welcome": return viewWelcome();
    case "class":   return viewClass();
    case "oath":    return viewOath();
    case "arsenal": return viewArsenal();
    case "handle":  return viewHandle();
    case "domains": return viewDomains();
    case "granted": return viewGranted();
  }
}

function bindFor(step) {
  if (step === "welcome") return bindWelcome();
  if (step === "class")   return bindClass();
  if (step === "oath")    return bindOath();
  if (step === "arsenal") return bindArsenal();
  if (step === "handle")  return bindHandle();
  if (step === "domains") return bindDomains();
  if (step === "granted") return bindGranted();
}

/* ---------- Welcome ---------- */
function viewWelcome() {
  return `
    <div class="welcome">
      <div class="welcome-inner">
        <div class="prompt-line">
          <span class="user">root@hackpulse</span>:~$ ./boot.sh --mode=signal<span class="cursor"></span>
        </div>
        <h1>
          <span class="line-1">welcome to</span>
          <span class="line-2"><span class="glitch" data-text="hack_pulse">hack_pulse</span></span>
        </h1>
        <p class="welcome-sub">
          Where the <span class="hl">signal</span> cuts through the <span class="hl">noise</span>.<br />
          A private collective of hackers, learners, and researchers.
        </p>
        <div class="welcome-cta">
          <button class="btn primary big" id="startBtn">
            <span>&gt; initialize</span>
            <span class="arrow">→</span>
          </button>
        </div>
        <div class="hint-row" style="justify-content:center; margin-top:28px;">
          <span>press <span class="kbd">enter</span> to continue</span>
          <span>·</span>
          <span>est. time <span style="color:var(--ink-dim)">2 min</span></span>
        </div>
      </div>
    </div>
  `;
}
function bindWelcome() {
  document.getElementById("startBtn").addEventListener("click", next);
}

/* ---------- Step 1: Class ---------- */
function viewClass() {
  return `
    ${stepHeader({
      n: 1,
      title: `Choose your <span class="accent">class</span>.`,
      sub: `Before we open the gates, tell us who you are so we can tailor the <span class="accent">briefing</span>.`,
    })}
    <div class="grid cols-3">
      ${CLASSES.map((c) => classCard(c)).join("")}
    </div>
    ${footerActions({ primaryLabel: "confirm class", primaryId: "confirmClass", disabled: !state.selectedClass })}
  `;
}
function classCard(c) {
  const sel = state.selectedClass === c.id ? "selected" : "";
  return `
    <div class="card ${sel}" data-class="${c.id}" role="button" tabindex="0">
      <span class="card-corner">0${CLASSES.indexOf(c) + 1}</span>
      <div class="card-icon">${c.icon}</div>
      <span class="card-kicker">${c.kicker}</span>
      <h3 class="card-title">${c.title}</h3>
      <p class="card-desc">${c.desc}</p>
    </div>
  `;
}
function bindClass() {
  document.querySelectorAll(".card[data-class]").forEach((el) => {
    el.addEventListener("click", () => {
      state.selectedClass = el.dataset.class;
      render();
    });
  });
  const btn = document.getElementById("confirmClass");
  if (btn) btn.addEventListener("click", () => awardAndNext("class"));
  bindBackBtn();
}

/* ---------- Step 2: Oath ---------- */
function viewOath() {
  return `
    ${stepHeader({
      n: 2,
      title: `This isn't a <span class="accent">playground</span>.`,
      sub: `At Hack Pulse we follow the <span class="accent">White Hat Code</span>. Read it. Live it. Break it and you're out.`,
    })}
    <div class="oath-box">
      <ul class="oath-list">
        <li><span class="tag">01</span><span><strong>Operate in authorized scope only.</strong> <span class="note">If you don't have written permission, you don't have a target.</span></span></li>
        <li><span class="tag">02</span><span><strong>Disclose responsibly.</strong> <span class="note">Report through proper channels. No extortion, no public zero-days dumped for clout.</span></span></li>
        <li><span class="tag">03</span><span><strong>Protect identities.</strong> <span class="note">What's shared in the room stays in the room. No doxxing, ever.</span></span></li>
        <li><span class="tag">04</span><span><strong>Lift others up.</strong> <span class="note">Every pro was a newbie yesterday. Answer the dumb questions.</span></span></li>
        <li><span class="tag">05</span><span><strong>Ship writeups.</strong> <span class="note">Knowledge you don't share dies with you. Contribute monthly.</span></span></li>
        <li><span class="tag">06</span><span><strong>No black hat.</strong> <span class="note">Ransomware, carding, and targeted harm get you banned and reported.</span></span></li>
      </ul>
    </div>
    ${footerActions({ primaryLabel: "I accept the code", primaryId: "acceptOath" })}
  `;
}
function bindOath() {
  document.getElementById("acceptOath").addEventListener("click", () => {
    state.oathAccepted = true;
    awardAndNext("oath");
  });
  bindBackBtn();
}

/* ---------- Step 3: Arsenal ---------- */
function viewArsenal() {
  return `
    ${stepHeader({
      n: 3,
      title: `Know your <span class="accent">arsenal</span>.`,
      sub: `Six rooms. One collective. Tap each to preview — we mark them as <span class="accent">briefed</span>.`,
    })}
    <div class="grid cols-2">
      ${ARSENAL.map((a) => arsenalCard(a)).join("")}
    </div>
    <div class="chip-counter">briefed: <span id="arsenalCount">${state.arsenalSeen.size}</span> / ${ARSENAL.length}</div>
    ${footerActions({
      primaryLabel: state.arsenalSeen.size < ARSENAL.length
        ? `open all rooms (${state.arsenalSeen.size}/${ARSENAL.length})`
        : "continue",
      primaryId: "arsenalNext",
      disabled: state.arsenalSeen.size < ARSENAL.length,
    })}
  `;
}
function arsenalCard(a) {
  const sel = state.arsenalSeen.has(a.id) ? "selected" : "";
  return `
    <div class="card ${sel}" data-arsenal="${a.id}" role="button" tabindex="0">
      <span class="card-corner">${state.arsenalSeen.has(a.id) ? "✓ briefed" : "// tap"}</span>
      <div class="card-icon">${a.icon}</div>
      <span class="card-kicker">${a.kicker}</span>
      <h3 class="card-title">${a.title}</h3>
      <p class="card-desc">${a.desc}</p>
    </div>
  `;
}
function bindArsenal() {
  document.querySelectorAll(".card[data-arsenal]").forEach((el) => {
    el.addEventListener("click", () => {
      state.arsenalSeen.add(el.dataset.arsenal);
      render();
    });
  });
  const btn = document.getElementById("arsenalNext");
  if (btn && !btn.disabled) btn.addEventListener("click", () => awardAndNext("arsenal"));
  bindBackBtn();
}

/* ---------- Step 4: Handle ---------- */
function viewHandle() {
  return `
    ${stepHeader({
      n: 4,
      title: `Choose your <span class="accent">callsign</span>.`,
      sub: `This is how the collective will know you. 3–20 chars. <span class="accent">letters</span>, <span class="accent">digits</span>, <span class="accent">_</span> only.`,
    })}
    <div class="field">
      <div class="field-label">// handle</div>
      <div class="field-prompt">
        <span class="prefix">&gt;</span>
        <input
          id="handleInput"
          type="text"
          maxlength="20"
          autocomplete="off"
          spellcheck="false"
          placeholder="neo_1999"
          value="${escapeHtml(state.handle)}"
        />
      </div>
      <div class="field-hint" id="handleHint">tip: pick something forgettable to the web, unforgettable to your squad.</div>
    </div>
    ${footerActions({ primaryLabel: "lock it in", primaryId: "confirmHandle", disabled: !isValidHandle(state.handle) })}
  `;
}
function bindHandle() {
  const input = document.getElementById("handleInput");
  const hint = document.getElementById("handleHint");
  const btn = document.getElementById("confirmHandle");

  setTimeout(() => input.focus(), 40);

  input.addEventListener("input", () => {
    state.handle = input.value.trim();
    const valid = isValidHandle(state.handle);
    btn.disabled = !valid;
    if (!state.handle) {
      hint.className = "field-hint";
      hint.textContent = "tip: pick something forgettable to the web, unforgettable to your squad.";
    } else if (!valid) {
      hint.className = "field-hint error";
      hint.textContent = "invalid: 3–20 chars, letters / digits / underscore only.";
    } else {
      hint.className = "field-hint ok";
      hint.textContent = `✓ callsign available. welcome, ${state.handle}.`;
    }
  });

  btn.addEventListener("click", () => {
    if (isValidHandle(state.handle)) awardAndNext("handle");
  });
  bindBackBtn();
}
function isValidHandle(s) {
  return /^[a-zA-Z0-9_]{3,20}$/.test(s);
}

/* ---------- Step 5: Domains ---------- */
function viewDomains() {
  return `
    ${stepHeader({
      n: 5,
      title: `What's your <span class="accent">target</span>?`,
      sub: `Pick at least <span class="accent">3</span> domains. We'll prioritize your feed and match you to rooms.`,
    })}
    <div class="chips">
      ${DOMAINS.map((d) => {
        const sel = state.domains.has(d) ? "selected" : "";
        return `<button class="chip ${sel}" data-domain="${escapeHtml(d)}">${d}</button>`;
      }).join("")}
    </div>
    <div class="chip-counter">selected: <span id="domainCount">${state.domains.size}</span> / ${DOMAINS.length} <span style="color:var(--ink-muted)">· min 3</span></div>
    ${footerActions({ primaryLabel: "tune feed", primaryId: "confirmDomains", disabled: state.domains.size < 3 })}
  `;
}
function bindDomains() {
  document.querySelectorAll(".chip[data-domain]").forEach((el) => {
    el.addEventListener("click", () => {
      const d = el.dataset.domain;
      if (state.domains.has(d)) state.domains.delete(d);
      else state.domains.add(d);
      render();
    });
  });
  const btn = document.getElementById("confirmDomains");
  if (btn && !btn.disabled) btn.addEventListener("click", () => awardAndNext("domains"));
  bindBackBtn();
}

/* ---------- Step 6: Granted ---------- */
function viewGranted() {
  const cls = CLASSES.find((c) => c.id === state.selectedClass);
  const domainsList = [...state.domains].join(", ");
  return `
    <div class="granted">
      <div class="granted-ascii">${grantedAscii()}</div>
      ${stepHeader({
        n: 6,
        title: `access <span class="accent">granted</span>.`,
        sub: `welcome to the collective, <span class="accent">${escapeHtml(state.handle)}</span>. your node is live.`,
      })}
    </div>
    <div class="summary">
      <div class="summary-row">
        <div class="summary-key">callsign</div>
        <div class="summary-val"><span class="accent">${escapeHtml(state.handle)}</span></div>
      </div>
      <div class="summary-row">
        <div class="summary-key">class</div>
        <div class="summary-val">${cls ? cls.title : "—"} <span style="color:var(--ink-muted)">· ${cls ? cls.kicker : ""}</span></div>
      </div>
      <div class="summary-row">
        <div class="summary-key">oath</div>
        <div class="summary-val">${state.oathAccepted ? `<span class="accent">signed</span> · white_hat_code.v1` : "—"}</div>
      </div>
      <div class="summary-row">
        <div class="summary-key">domains</div>
        <div class="summary-val">${escapeHtml(domainsList)}</div>
      </div>
      <div class="summary-row">
        <div class="summary-key">xp</div>
        <div class="summary-val"><span class="accent">${state.xp}</span> xp earned</div>
      </div>
    </div>
    <div class="actions">
      <button class="btn back" id="restartBtn"><span class="arrow">→</span><span>restart</span></button>
      <div class="spacer"></div>
      <button class="btn primary big" id="enterBtn">
        <span>enter hack_pulse</span>
        <span class="arrow">→</span>
      </button>
    </div>
  `;
}
function bindGranted() {
  document.getElementById("restartBtn").addEventListener("click", restart);
  document.getElementById("enterBtn").addEventListener("click", () => {
    state.xp += XP_PER_STEP.enter;
    animateXP(state.xp);
    const btn = document.getElementById("enterBtn");
    btn.innerHTML = '<span>uplink established ✓</span>';
    btn.disabled = true;
  });
}

/* ---------- Helpers ---------- */
function stepHeader({ n, title, sub }) {
  const pct = (n / 6) * 100;
  return `
    <div class="step-header">
      <div class="step-label"><span class="dot"></span> step ${String(n).padStart(2, "0")} / 06</div>
      <h2 class="step-title">${title}</h2>
      <p class="step-sub">${sub}</p>
      <div class="progress">
        <div class="progress-fill" style="width:${pct}%"></div>
        <div class="progress-ticks">${'<span></span>'.repeat(6)}</div>
      </div>
    </div>
  `;
}

function footerActions({ primaryLabel, primaryId, disabled = false }) {
  return `
    <div class="actions">
      <button class="btn back" id="footerBack">
        <span class="arrow">→</span>
        <span>back</span>
      </button>
      <div class="spacer"></div>
      <button class="btn primary" id="${primaryId}" ${disabled ? "disabled" : ""}>
        <span>${primaryLabel}</span>
        <span class="arrow">→</span>
      </button>
    </div>
  `;
}

function bindBackBtn() {
  const b = document.getElementById("footerBack");
  if (b) b.addEventListener("click", goBack);
}

function awardAndNext(stepId) {
  const xp = XP_PER_STEP[stepId] || 0;
  state.xp += xp;
  next();
}

function next() {
  if (state.idx < STEPS.length - 1) {
    state.idx++;
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
function goBack() {
  if (state.idx > 0) {
    state.idx--;
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
function restart() {
  state.idx = 0;
  state.xp = 0;
  state.selectedClass = null;
  state.oathAccepted = false;
  state.arsenalSeen = new Set();
  state.handle = "";
  state.domains = new Set();
  render();
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function grantedAscii() {
  return `
 ╭─────────────────────────────────────╮
 │  [ UPLINK ESTABLISHED · NODE OK ]   │
 ╰─────────────────────────────────────╯`;
}

/* ---------- Icons (inline SVG) ---------- */
function iconBase(path) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}
function iconTerminal()  { return iconBase('<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>'); }
function iconFlag()      { return iconBase('<path d="M4 21V4h10l-1 4h7v9h-9l-1-3H6v7"/>'); }
function iconGhost()     { return iconBase('<path d="M5 12a7 7 0 0 1 14 0v9l-3-2-2 2-2-2-2 2-2-2-3 2z"/><circle cx="9.5" cy="11" r="1"/><circle cx="14.5" cy="11" r="1"/>'); }
function iconRss()       { return iconBase('<path d="M4 4a16 16 0 0 1 16 16"/><path d="M4 10a10 10 0 0 1 10 10"/><circle cx="5.5" cy="18.5" r="1.5"/>'); }
function iconWrench()    { return iconBase('<path d="M14.7 6.3a4 4 0 0 1 5 5l-2.3 2.3-5-5 2.3-2.3z"/><path d="M12.4 8.6 3.5 17.5a2.1 2.1 0 0 0 3 3l8.9-8.9"/>'); }
function iconRadio()     { return iconBase('<circle cx="12" cy="12" r="2"/><path d="M8.5 8.5a5 5 0 0 0 0 7"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M5.5 5.5a9 9 0 0 0 0 13"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/>'); }
function iconEye()       { return iconBase('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'); }
function iconTarget()    { return iconBase('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>'); }

/* ---------- Matrix rain ---------- */
function initMatrix() {
  const canvas = document.getElementById("matrix");
  const ctx = canvas.getContext("2d");
  const glyphs = "01アイウエオカキクケコサシスセソタチツテト<>/#$%&*+-=[]{}()";
  let cols = 0, drops = [], fontSize = 14, w = 0, h = 0;

  function resize() {
    w = canvas.width = window.innerWidth * devicePixelRatio;
    h = canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    fontSize = 14 * devicePixelRatio;
    cols = Math.floor(w / fontSize);
    drops = new Array(cols).fill(0).map(() => Math.random() * -50);
  }
  resize();
  window.addEventListener("resize", resize);

  function tick() {
    ctx.fillStyle = "rgba(5, 8, 7, 0.09)";
    ctx.fillRect(0, 0, w, h);
    ctx.font = `${fontSize}px JetBrains Mono, monospace`;
    for (let i = 0; i < cols; i++) {
      const ch = glyphs[Math.floor(Math.random() * glyphs.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;
      ctx.fillStyle = Math.random() > 0.985 ? "#b8ffd1" : "#00ff88";
      ctx.fillText(ch, x, y);
      if (y > h && Math.random() > 0.975) drops[i] = 0;
      drops[i] += 1;
    }
    requestAnimationFrame(tick);
  }
  tick();
}

/* ---------- Sys bar ---------- */
function initSysBar() {
  const lat = document.getElementById("sysLat");
  const node = document.getElementById("sysNode");
  const ts = document.getElementById("sysTs");
  node.textContent = Math.random().toString(36).slice(2, 6);
  setInterval(() => {
    lat.textContent = 8 + Math.floor(Math.random() * 18);
    const d = new Date();
    ts.textContent = [d.getHours(), d.getMinutes(), d.getSeconds()]
      .map((n) => String(n).padStart(2, "0"))
      .join(":");
  }, 1000);
}
