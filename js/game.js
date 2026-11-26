// =========================================================
// ALEAN SEA — игровая логика
// =========================================================
"use strict";

const SAVE_KEY = "alean_sea_save_v1";

const defaultState = () => ({
  name: "", variant: "azure",
  xp: 0, pearls: 30, mood: 80,
  createdAt: Date.now(),
  lastVisitDay: "", streak: 0, visits: 0,
  factsSeen: [], creaturesFound: [], itemsFound: [],
  achievements: {},
  gamesPlayed: { quiz: 0, treasure: 0, cleanup: 0, explore: 0 },
  ecoPoints: 0,
  fedToday: false, pettedToday: 0,
  daily: { day: "", done: {}, counts: {} },
  decorated: [],
});

let S = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return Object.assign(defaultState(), JSON.parse(raw));
  } catch (e) { return null; }
}
function saveState() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {}
}
function todayStr() { return new Date().toISOString().slice(0, 10); }

function levelInfo(xp) {
  let cur = STAGES[0];
  for (const st of STAGES) if (xp >= st.xp) cur = st;
  return cur;
}
function nextStage(xp) {
  for (const st of STAGES) if (xp < st.xp) return st;
  return null;
}

// ---------- утилиты UI ----------
const $ = (sel) => document.querySelector(sel);
function show(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  $(id).classList.add("active");
  window.scrollTo(0, 0);
}
function toast(msg, icon) {
  const t = document.createElement("div");
  t.className = "toast";
  t.innerHTML = (icon ? `<span class="t-ic">${icon}</span>` : "") + msg;
  $("#toasts").appendChild(t);
  setTimeout(() => t.classList.add("show"), 20);
  setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 400); }, 2600);
}
function grantAchievement(id) {
  if (S.achievements[id]) return;
  const a = ACHIEVEMENTS.find(x => x.id === id);
  if (!a) return;
  S.achievements[id] = true;
  S.pearls += 20;
  toast(`Достижение «${a.name}»! +20 жемчужин`, a.icon);
  saveState(); renderAll();
}
function checkAchievements() {
  if (S.factsSeen.length >= 5) grantAchievement("facts5");
  if (S.factsSeen.length >= FACTS.length) grantAchievement("facts12");
  if (S.creaturesFound.length >= 5) grantAchievement("collector");
  if (S.ecoPoints >= 10) grantAchievement("eco10");
  if (S.pearls >= 200) grantAchievement("rich");
  const lvl = levelInfo(S.xp).level;
  if (lvl >= 4) grantAchievement("legend");
  const open = LOCATIONS.filter(l => l.minLevel <= lvl).length;
  if (open >= 2) grantAchievement("explorer");
  if (open === LOCATIONS.length) grantAchievement("world");
}
function addXP(n) {
  const before = levelInfo(S.xp).level;
  S.xp += n;
  const after = levelInfo(S.xp).level;
  if (after > before) {
    toast(`${S.name} вырос до стадии «${STAGES[after-1].name}»!`, "🎉");
  }
  saveState(); renderAll(); checkAchievements();
}
function addPearls(n) { S.pearls += n; saveState(); renderAll(); checkAchievements(); }

// ---------- SVG дельфин ----------
function dolphinSVG(variantId, scale, opts = {}) {
  const v = VARIANTS.find(x => x.id === variantId) || VARIANTS[0];
  const stage = opts.stage || levelInfo(S.xp).level;
  const extra = stage >= 4 ? `<circle cx="120" cy="90" r="78" fill="none" stroke="#ffd97a" stroke-width="2.5" opacity="0.55" stroke-dasharray="6 7"/>
    <path d="M95 48 l6 -14 6 14 z" fill="#ffd97a"/><path d="M88 62 l4 -10 5 10 z" fill="#ffe9a8"/>` : "";
  const spark = stage >= 3 ? `<path d="M178 62 q10 -12 22 -10 q-8 10 -22 10z" fill="${v.fin}" opacity="0.9"/>` : "";
  return `
  <svg viewBox="0 0 240 150" class="dolphin-svg" style="width:${Math.round(240*scale)}px" aria-label="Дельфин">
    <defs>
      <linearGradient id="g${variantId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${v.body}"/><stop offset="1" stop-color="${v.fin}"/>
      </linearGradient>
    </defs>
    ${extra}
    <path d="M30 92 Q60 40 120 38 Q185 36 205 78 Q210 88 200 92 Q150 116 92 112 Q45 108 30 92 Z" fill="url(#g${variantId})"/>
    <path d="M60 96 Q110 116 168 96 Q120 106 60 96 Z" fill="${v.belly}" opacity="0.9"/>
    <path d="M98 40 Q112 12 132 22 Q118 34 112 44 Z" fill="${v.fin}"/>
    <path d="M118 96 Q136 118 154 106 Q138 98 126 90 Z" fill="${v.fin}"/>
    <path d="M28 92 L6 70 Q16 94 8 112 Z" fill="${v.fin}"/>
    ${spark}
    <circle cx="176" cy="62" r="5.5" fill="#10233a"/>
    <circle cx="178" cy="60" r="1.8" fill="#fff"/>
    <path d="M186 78 Q196 82 202 78" stroke="#0e2237" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <circle cx="164" cy="84" r="4" fill="#fff" opacity="0.35"/>
  </svg>`;
}

// ---------- ежедневные задания ----------
function seedRandom(seed) { let h = 0; for (const c of seed) h = (h*31 + c.charCodeAt(0)) >>> 0; return () => { h = (h*1664525 + 1013904223) >>> 0; return h / 4294967296; }; }
function dailyTasks() {
  const day = todayStr();
  if (S.daily.day !== day) S.daily = { day, done: {}, counts: {} };
  const rnd = seedRandom("alean" + day);
  const pool = [...TASK_POOL];
  const picked = [];
  while (picked.length < DAILY_TASK_COUNT && pool.length) {
    picked.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
  }
  return picked;
}
function taskProgress(task) {
  const c = S.daily.counts[task.id] || 0;
  const need = { facts: 2, pet: 2 }[task.id] || 1;
  return Math.min(c, need);
}
function taskComplete(id) {
  if (S.daily.done[id]) return;
  const t = dailyTasks().find(x => x.id === id);
  if (!t) return;
  S.daily.done[id] = true;
  addPearls(t.reward);
  addXP(10);
  toast(`Задание выполнено: «${t.name}» +${t.reward} 💠`, "✅");
  saveState(); renderAll();
}
function tickTask(id, n = 1) {
  const t = dailyTasks().find(x => x.id === id);
  if (!t || S.daily.done[id]) return;
  S.daily.counts[id] = (S.daily.counts[id] || 0) + n;
  const need = { facts: 2, pet: 2 }[id] || 1;
  if (S.daily.counts[id] >= need) taskComplete(id);
  else saveState();
}

// ---------- визит и стрик ----------
function onVisit() {
  const day = todayStr();
  if (S.lastVisitDay !== day) {
    const y = new Date(); y.setDate(y.getDate() - 1);
    S.streak = (S.lastVisitDay === y.toISOString().slice(0,10)) ? S.streak + 1 : 1;
    S.lastVisitDay = day;
    S.visits++;
    S.mood = Math.max(10, S.mood - 6); // настроение чуть падает между визитами
    S.fedToday = false; S.pettedToday = 0;
    if (S.visits > 1) toast(`С возвращением! Серия визитов: ${S.streak} дн.`, "🌅");
    if (S.streak >= 3) grantAchievement("streak3");
  }
  saveState();
}

// ---------- онбординг ----------
function startOnboarding() {
  $("#ob-slides").innerHTML = `
    <div class="slide-card">
      <h2>Познакомься с ALEAN SEA</h2>
      <p>Твоё морское приключение в Анапе! Вырасти дельфина, исследуй Чёрное море, выполняй задания и заботься об океане.</p>
      <div class="ob-points">
        <div>🐬 Развивай своего дельфина</div>
        <div>🗺️ Открывай новые локации</div>
        <div>💠 Зарабатывай жемчужины</div>
        <div>🌱 Спасай море от мусора</div>
      </div>
      <button class="btn primary big" id="ob-next">Далее</button>
    </div>`;
  $("#ob-next").onclick = () => slideChoose();
}
function slideChoose() {
  $("#ob-slides").innerHTML = `
    <div class="slide-card">
      <h2>Выбери своего дельфина</h2>
      <div class="variant-row">
        ${VARIANTS.map(v => `
          <button class="variant" data-v="${v.id}">
            <div class="var-ic" style="background:linear-gradient(140deg,${v.body},${v.fin})"></div>
            <span>${v.name}</span>
          </button>`).join("")}
      </div>
      <label class="lbl">Имя дельфина</label>
      <input id="dolphin-name" maxlength="14" placeholder="Например: Бриз" value="">
      <div id="ob-preview" style="margin:10px 0"></div>
      <button class="btn primary big" id="ob-finish" disabled>Начать приключение</button>
    </div>`;
  let chosen = null;
  $("#ob-preview").innerHTML = dolphinSVG("azure", 0.85);
  document.querySelectorAll(".variant").forEach(b => {
    b.onclick = () => {
      document.querySelectorAll(".variant").forEach(x => x.classList.remove("sel"));
      b.classList.add("sel"); chosen = b.dataset.v;
      $("#ob-preview").innerHTML = dolphinSVG(chosen, 0.85);
      $("#ob-finish").disabled = !$("#dolphin-name").value.trim();
    };
  });
  $("#dolphin-name").oninput = () => { $("#ob-finish").disabled = !(chosen && $("#dolphin-name").value.trim()); };
  $("#ob-finish").onclick = () => {
    S.variant = chosen;
    S.name = $("#dolphin-name").value.trim();
    saveState(); grantAchievement("first");
    toast(`Добро пожаловать, ${S.name}!`, "🐬");
    show("#screen-home"); renderAll();
  };
}

// ---------- рендер ----------
function moodWord() { return S.mood >= 70 ? "Отличное" : S.mood >= 40 ? "Хорошее" : "Грустит"; }
function moodIcon()  { return S.mood >= 70 ? "😄" : S.mood >= 40 ? "🙂" : "😢"; }

function renderAll() {
  if (!S || !S.name) return;
  const lvl = levelInfo(S.xp);
  const nxt = nextStage(S.xp);
  const pct = nxt ? Math.round((S.xp - lvl.xp) / (nxt.xp - lvl.xp) * 100) : 100;

  // Home / Мой дельфин
  $("#home-dolphin").innerHTML = dolphinSVG(S.variant, lvl.size);
  $("#home-name").textContent = S.name;
  $("#home-stage").textContent = `Стадия: ${lvl.name}`;
  $("#home-xp-bar").style.width = pct + "%";
  $("#home-xp-text").textContent = nxt ? `XP ${S.xp} / ${nxt.xp}` : `Максимальная стадия!`;
  $("#stat-pearls").textContent = S.pearls;
  $("#stat-eco").textContent = S.ecoPoints;
  $("#stat-mood").textContent = moodWord();
  $("#stat-mood-ic").textContent = moodIcon();

  // Задания
  const tasks = dailyTasks();
  $("#tasks-list").innerHTML = tasks.map(t => {
    const done = S.daily.done[t.id];
    const need = { facts: 2, pet: 2 }[t.id] || 1;
    const p = taskProgress(t);
    return `<div class="task-card ${done ? "done" : ""}">
      <div class="task-ic">${t.icon}</div>
      <div class="task-body">
        <div class="task-name">${t.name}</div>
        <div class="task-hint">${t.hint}</div>
        ${need > 1 && !done ? `<div class="mini-bar"><i style="width:${p/need*100}%"></i></div>` : ""}
      </div>
      <div class="task-reward">+${t.reward} 💠</div>
    </div>`;
  }).join("");

  // Мир
  const openCount = LOCATIONS.filter(l => l.minLevel <= lvl.level).length;
  $("#world-grid").innerHTML = LOCATIONS.map(l => {
    const locked = l.minLevel > lvl.level;
    return `<div class="loc-card ${locked ? "locked" : ""}" data-loc="${l.id}">
      <div class="loc-art loc-${l.id}">${locked ? "🔒" : locationIcon(l.id)}</div>
      <div class="loc-name">${l.name}</div>
      <div class="loc-desc">${locked ? `Откроется на стадии «${STAGES[l.minLevel-1].name}»` : l.desc}</div>
      ${locked ? "" : `<button class="btn small" data-act="${l.act}" data-locname="${l.name}">${l.actName}</button>`}
    </div>`;
  }).join("");
  document.querySelectorAll("#world-grid [data-act]").forEach(b => {
    b.onclick = (e) => { e.stopPropagation(); launchGame(b.dataset.act, b.dataset.locname); };
  });

  // Коллекция
  $("#ach-grid").innerHTML = ACHIEVEMENTS.map(a => {
    const got = !!S.achievements[a.id];
    return `<div class="ach ${got ? "" : "miss"}">
      <div class="ach-ic">${got ? a.icon : "❔"}</div>
      <div class="ach-name">${a.name}</div>
      <div class="ach-desc">${a.desc}</div>
    </div>`;
  }).join("");

  const allItems = [...CREATURES.map(c => ({...c, kind: "Существо"}))];
  $("#collection-list").innerHTML = allItems.map(it => {
    const got = S.creaturesFound.includes(it.id);
    return `<div class="col-item ${got ? "" : "miss"}">
      <span class="col-ic">${got ? it.emoji : "❔"}</span>
      <div><div class="col-name">${got ? it.name : "???"}</div>
      <div class="col-kind">${it.kind}</div></div>
    </div>`;
  }).join("");

  // Экология: факты
  $("#facts-list").innerHTML = FACTS.map(f => `
    <div class="fact-card ${S.factsSeen.includes(f.id) ? "seen" : ""}" data-fact="${f.id}">
      <div class="fact-title">${S.factsSeen.includes(f.id) ? "✓ " : ""}${f.title}</div>
      <div class="fact-text">${f.text}</div>
    </div>`).join("");
  document.querySelectorAll("[data-fact]").forEach(el => {
    el.onclick = () => {
      const id = el.dataset.fact;
      if (!S.factsSeen.includes(id)) { S.factsSeen.push(id); addXP(4); tickTask("facts"); checkAchievements(); saveState(); renderAll(); }
    };
  });
}

function locationIcon(id) {
  return { coast: "🌊", reef: "🪸", cave: "🕳️", open: "🐬", deep: "🌌" }[id] || "🌊";
}

// ---------- забота о дельфине ----------
function petDolphin() {
  S.mood = Math.min(100, S.mood + 6);
  S.pettedToday++;
  const d = $("#home-dolphin");
  d.classList.remove("bounce"); void d.offsetWidth; d.classList.add("bounce");
  if (S.fedToday && S.pettedToday >= 2) tickTask("pet", 1); else if (S.pettedToday >= 2) tickTask("pet", 1);
  if (S.mood >= 80) tickTask("mood");
  saveState(); renderAll();
  toast(`${S.name} доволен!`, "💙");
}
function feedDolphin() {
  if (S.fedToday) { toast("Дельфин уже наелся сегодня", "🐟"); return; }
  if (S.pearls < 5) { toast("Нужно 5 жемчужин на угощение", "💠"); return; }
  S.pearls -= 5; S.fedToday = true; S.mood = Math.min(100, S.mood + 15);
  if (S.pettedToday >= 1 || S.fedToday) tickTask("pet", 1);
  if (S.mood >= 80) tickTask("mood");
  saveState(); renderAll();
  toast(`${S.name} съел порцию рыбы! −5 💠`, "🐟");
}

// ---------- мини-игры ----------
function launchGame(kind, locName) {
  ({ quiz: gameQuiz, treasure: gameTreasure, cleanup: gameCleanup, explore: gameExplore })[kind](locName);
}

function openModal(html) { $("#modal").innerHTML = `<div class="modal-box">${html}</div>`; $("#modal").classList.add("open"); }
function closeModal() { $("#modal").classList.remove("open"); $("#modal").innerHTML = ""; }
function finishGame(stats, ecobonus) {
  const { pearls, xp } = stats;
  addPearls(pearls); addXP(xp);
  if (ecobonus) { S.ecoPoints += ecobonus; if (S.ecoPoints >= 1) grantAchievement("eco1"); checkAchievements(); saveState(); }
  openModal(`<h2>Игра завершена!</h2>
    <div class="reward-row"><span>+${pearls} 💠 жемчужин</span><span>+${xp} XP</span>${ecobonus ? `<span>+${ecobonus} 🌱 эко</span>` : ""}</div>
    <button class="btn primary" onclick="closeModal()">Отлично!</button>`);
}

// 1) Викторина
function gameQuiz() {
  const qs = [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5);
  let i = 0, correct = 0;
  S.gamesPlayed.quiz++;
  function step() {
    if (i >= qs.length) {
      if (correct >= 5) grantAchievement("quizwin");
      tickTask("quiz");
      finishGame({ pearls: correct * 6, xp: correct * 6 });
      return;
    }
    const q = qs[i];
    openModal(`<div class="quiz-head">Вопрос ${i+1} из ${qs.length}</div>
      <h2>${q.q}</h2>
      <div class="quiz-opts">
        ${q.a.map((a, k) => `<button class="btn opt" data-k="${k}">${a}</button>`).join("")}
      </div>`);
    document.querySelectorAll(".opt").forEach(b => {
      b.onclick = () => {
        if (+b.dataset.k === q.c) { correct++; b.classList.add("ok"); }
        else b.classList.add("bad");
        document.querySelectorAll(".opt").forEach(x => x.disabled = true);
        setTimeout(() => { i++; step(); }, 700);
      };
    });
  }
  step();
}

// 2) Сбор сокровищ (аркада)
function gameTreasure() {
  S.gamesPlayed.treasure++;
  openModal(`<h2>Сбор сокровищ</h2>
    <p class="hint">Веди дельфина пальцем. Собирай жемчужины, избегай медуз!</p>
    <canvas id="game-canvas" width="340" height="420"></canvas>
    <div id="game-hud"></div>`);
  const cv = $("#game-canvas"), ctx = cv.getContext("2d");
  let px = 170, score = 0, lives = 3, t = 0, run = true;
  const items = [];
  const setPx = (clientX) => {
    const r = cv.getBoundingClientRect();
    px = (clientX - r.left) * (cv.width / r.width);
  };
  cv.ontouchmove = cv.onmousemove = (e) => { e.preventDefault?.(); setPx(e.touches ? e.touches[0].clientX : e.clientX); };
  cv.onclick = (e) => setPx(e.clientX);
  const iv = setInterval(() => {
    if (!run) return;
    t++;
    if (t % 22 === 0) items.push({ x: 20 + Math.random()*300, y: -20, v: 1.6 + Math.random()*1.6 + t/400, type: Math.random() < 0.75 ? "pearl" : "jelly" });
    const hudEl = $("#game-hud");
    if (!hudEl) { run = false; clearInterval(iv); return; } // модалка закрыта
    ctx.clearRect(0, 0, 340, 420);
    const g = ctx.createLinearGradient(0, 0, 0, 420);
    g.addColorStop(0, "#0b3a5e"); g.addColorStop(1, "#062035");
    ctx.fillStyle = g; ctx.fillRect(0, 0, 340, 420);
    // дельфин
    ctx.fillStyle = VARIANTS.find(v => v.id === S.variant).body;
    ctx.beginPath(); ctx.ellipse(px, 370, 34, 16, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(px - 30, 362); ctx.lineTo(px - 46, 348); ctx.lineTo(px - 26, 368); ctx.fill();
    ctx.beginPath(); ctx.moveTo(px, 356); ctx.lineTo(px + 6, 340); ctx.lineTo(px + 12, 356); ctx.fill();
    ctx.fillStyle = "#0e2237"; ctx.beginPath(); ctx.arc(px + 20, 364, 3, 0, Math.PI*2); ctx.fill();
    for (let k = items.length - 1; k >= 0; k--) {
      const it = items[k]; it.y += it.v;
      if (it.type === "pearl") {
        ctx.fillStyle = "#dff3ff"; ctx.beginPath(); ctx.arc(it.x, it.y, 9, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "#9fd4f0"; ctx.beginPath(); ctx.arc(it.x - 2, it.y - 2, 3, 0, Math.PI*2); ctx.fill();
      } else {
        ctx.strokeStyle = "#b48ae0"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(it.x, it.y, 11, Math.PI, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(it.x - 8, it.y - 4); ctx.lineTo(it.x - 12, it.y + 10);
        ctx.moveTo(it.x + 8, it.y - 4); ctx.lineTo(it.x + 12, it.y + 10);
        ctx.moveTo(it.x, it.y); ctx.lineTo(it.x, it.y + 14); ctx.stroke();
      }
      if (it.y > 350 && it.y < 400 && Math.abs(it.x - px) < 42) {
        if (it.type === "pearl") score++;
        else lives--;
        items.splice(k, 1);
        continue;
      }
      if (it.y > 440) items.splice(k, 1);
    }
    hudEl.innerHTML = `💠 ${score} &nbsp; ❤️ ${"♥".repeat(lives)}${"♡".repeat(3-lives)}`;
    if (t > 60 * 40 || lives <= 0) {
      run = false; clearInterval(iv);
      tickTask("treasure");
      finishGame({ pearls: Math.max(4, score * 3), xp: Math.max(4, score * 2) });
    }
  }, 25);
}

// 3) Эко-патруль (уборка)
function gameCleanup() {
  S.gamesPlayed.cleanup++;
  const trash = ["🥤", "🛍️", "🍾", "🎣", "🧴", "🥫", "🪝", "🫙"];
  const spots = [...Array(8)].map((_, i) => ({ x: 8 + (i % 2) * 48 + Math.random() * 6, y: 6 + Math.floor(i / 2) * 22 + Math.random() * 4 }));
  let left = trash.length;
  openModal(`<h2>Эко-патруль</h2>
    <p class="hint">Море загрязнено! Нажми на каждый предмет мусора, чтобы убрать его.</p>
    <div class="cleanup-sea">
      ${trash.map((t2, i) => `<button class="trash" style="left:${spots[i].x}%;top:${spots[i].y}%" data-i="${i}">${t2}</button>`).join("")}
    </div>
    <div id="game-hud">Осталось: ${left}</div>`);
  document.querySelectorAll(".trash").forEach(b => {
    b.onclick = () => {
      b.classList.add("gone"); b.disabled = true; left--;
      $("#game-hud").textContent = left > 0 ? `Осталось: ${left}` : "Море чистое! 🌊";
      if (left === 0) setTimeout(() => { tickTask("cleanup"); finishGame({ pearls: 18, xp: 14 }, 3); }, 600);
    };
  });
}

// 4) Исследование локации
function gameExplore(locName) {
  S.gamesPlayed.explore++;
  const loc = LOCATIONS.find(l => l.name === locName) || LOCATIONS[1];
  const pool = CREATURES.filter(c => c.where === loc.id || Math.random() < 0.4).slice(0, 3);
  const foundSet = [];
  openModal(`<h2>Исследование: ${loc.name}</h2>
    <p class="hint">Коснись трёх мест, где может прятаться морская жизнь.</p>
    <div class="explore-sea exp-${loc.id}">
      ${[0,1,2].map(i => `<button class="hotspot" style="left:${12 + i*30 + Math.random()*8}%;top:${25 + (i%2)*35}%"></button>`).join("")}
    </div>
    <div id="explore-found"></div>`);
  document.querySelectorAll(".hotspot").forEach((h, i) => {
    h.onclick = () => {
      if (h.classList.contains("found")) return;
      h.classList.add("found");
      const cr = pool[i];
      if (cr) {
        foundSet.push(cr);
        if (!S.creaturesFound.includes(cr.id)) S.creaturesFound.push(cr.id);
        $("#explore-found").innerHTML += `<div class="found-chip">${cr.emoji} ${cr.name} добавлен в коллекцию!</div>`;
      } else {
        $("#explore-found").innerHTML += `<div class="found-chip">Здесь только красивые камни…</div>`;
      }
      checkAchievements(); saveState();
      if (document.querySelectorAll(".hotspot.found").length === 3) {
        setTimeout(() => { tickTask("explore"); finishGame({ pearls: 12, xp: 12 }); }, 800);
      }
    };
  });
}

// ---------- настройки: экспорт / сброс ----------
function exportSave() {
  const code = btoa(unescape(encodeURIComponent(JSON.stringify(S))));
  openModal(`<h2>Резервная копия</h2>
    <p class="hint">Сохрани этот код, чтобы перенести прогресс на другое устройство.</p>
    <textarea id="save-code" rows="4" readonly>${code}</textarea>
    <div class="btn-row">
      <button class="btn" id="cp-code">Скопировать</button>
      <button class="btn primary" onclick="closeModal()">Готово</button>
    </div>
    <hr>
    <label class="lbl">Импорт кода</label>
    <textarea id="imp-code" rows="3" placeholder="Вставь код сюда"></textarea>
    <button class="btn" id="do-import">Импортировать</button>`);
  $("#cp-code").onclick = () => { $("#save-code").select(); document.execCommand("copy"); toast("Код скопирован", "📋"); };
  $("#do-import").onclick = () => {
    try {
      const obj = JSON.parse(decodeURIComponent(escape(atob($("#imp-code").value.trim()))));
      S = Object.assign(defaultState(), obj); saveState(); closeModal(); renderAll();
      toast("Прогресс восстановлен!", "✅");
    } catch (e) { toast("Неверный код", "⚠️"); }
  };
}
function resetGame() {
  openModal(`<h2>Начать заново?</h2>
    <p class="hint">Весь прогресс будет удалён безвозвратно (можно сначала сделать резервную копию).</p>
    <div class="btn-row">
      <button class="btn" onclick="closeModal()">Отмена</button>
      <button class="btn danger" id="do-reset">Удалить прогресс</button>
    </div>`);
  $("#do-reset").onclick = () => { localStorage.removeItem(SAVE_KEY); S = null; location.reload(); };
}

// ---------- навигация и запуск ----------
function initNav() {
  document.querySelectorAll(".tab").forEach(t => {
    t.onclick = () => {
      document.querySelectorAll(".tab").forEach(x => x.classList.remove("active"));
      t.classList.add("active");
      show(t.dataset.screen);
    };
  });
  $("#btn-play").onclick = () => { document.querySelector('.tab[data-screen="#screen-world"]').click(); };
  $("#btn-pet").onclick = petDolphin;
  $("#btn-feed").onclick = feedDolphin;
  $("#btn-export").onclick = exportSave;
  $("#btn-reset").onclick = resetGame;
  $("#modal").addEventListener("click", (e) => { if (e.target.id === "modal") closeModal(); });
}

window.addEventListener("error", (e) => { /* мягкая обработка: игра не падает */ });

function boot() {
  initNav();
  if (S && S.name) { onVisit(); show("#screen-home"); renderAll(); checkAchievements(); }
  else { S = defaultState(); saveState(); show("#screen-start"); }
}
document.addEventListener("DOMContentLoaded", boot);