const STORAGE_KEY = "promodoro_data_v3";
const CIRC = 754;

// ---------- Global State ----------
let state = {
  name: "",
  dailyGoal: 60,
  notifications: false,
  sound: true,
  autoBreak: true,
  focusMinutes: 25,
  breakMinutes: 5,

  streak: 0,
  minutesToday: 0,
  minutesYesterday: 0,
  minutesDayBefore: 0,
  goalReachedToday: false,

  sessions: [], // { day, type, start, end, mins }
  lastDate: new Date().toISOString().slice(0, 10)
};

let timeLeft = 25 * 60;
let totalSeconds = 25 * 60;
let timer = null;
let isRunning = false;
let isBreakMode = false;
let sessionStartedAt = null;
let deferredPrompt = null;

// ---------- Elements ----------
const tabs = document.querySelectorAll(".tab");
const views = {
  focus: document.getElementById("view-focus"),
  sessions: document.getElementById("view-sessions"),
  analytics: document.getElementById("view-analytics"),
  profile: document.getElementById("view-profile")
};

const timerCard = document.getElementById("timerCard");
const timerText = document.getElementById("timerText");
const progressRing = document.getElementById("progressRing");
const sessionState = document.getElementById("sessionState");
const motivationText = document.getElementById("motivationText");

const mainBtn = document.getElementById("mainBtn");
const minusBtn = document.getElementById("minusBtn");
const plusBtn = document.getElementById("plusBtn");

const todayMinutes = document.getElementById("todayMinutes");
const todaySessions = document.getElementById("todaySessions");
const todayGoal = document.getElementById("todayGoal");
const sessionList = document.getElementById("sessionList");

const streakVal = document.getElementById("streakVal");
const yesterdayVal = document.getElementById("yesterdayVal");
const dayBeforeVal = document.getElementById("dayBeforeVal");

const nameInput = document.getElementById("nameInput");
const goalInput = document.getElementById("goalInput");
const notifToggle = document.getElementById("notifToggle");
const soundToggle = document.getElementById("soundToggle");
const saveProfileBtn = document.getElementById("saveProfileBtn");

const onboardModal = document.getElementById("onboardModal");
const onbName = document.getElementById("onbName");
const onbGoal = document.getElementById("onbGoal");
const onbNotif = document.getElementById("onbNotif");
const onboardBtn = document.getElementById("onboardBtn");

const installBtn = document.getElementById("installBtn");

const sfxStart = document.getElementById("sfxStart");
const sfxAlarm = document.getElementById("sfxAlarm");

// ---------- Helpers ----------
function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    state = { ...state, ...JSON.parse(raw) };
  } catch {}
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

function setTimerForMode() {
  const mins = isBreakMode ? state.breakMinutes : state.focusMinutes;
  totalSeconds = mins * 60;
  timeLeft = totalSeconds;
  renderTimer();
}

function notify(title, body) {
  if (state.notifications && Notification.permission === "granted") {
    new Notification(title, { body });
  }
}

function maybePlay(audioEl) {
  if (!state.sound) return;
  audioEl.play().catch(() => {});
}

function rollDayIfNeeded() {
  const t = todayKey();
  if (state.lastDate === t) return;

  // Move day buckets
  state.minutesDayBefore = state.minutesYesterday;
  state.minutesYesterday = state.minutesToday;
  state.minutesToday = 0;
  state.goalReachedToday = false;
  state.lastDate = t;

  saveState();
}

function getMotivationLine() {
  const lines = [
    "“Discipline beats motivation.”",
    "“One session at a time, one level at a time.”",
    "“Focus now. Flex later.”",
    "“Your streak is your identity.”",
    "“Tiny sessions compound into huge wins.”"
  ];
  return lines[Math.floor(Math.random() * lines.length)];
}

// ---------- Render ----------
function renderTimer() {
  timerText.textContent = formatTime(timeLeft);
  const offset = CIRC - (timeLeft / totalSeconds) * CIRC;
  progressRing.style.strokeDashoffset = offset;

  if (isBreakMode) {
    sessionState.textContent = isRunning ? "Break Running ☕" : "Break Ready";
  } else {
    sessionState.textContent = isRunning ? "Focus Running 🔥" : "Focus Ready";
  }
}

function renderMotivation() {
  motivationText.textContent = getMotivationLine();
}

function renderSessions() {
  const today = todayKey();
  const logs = state.sessions.filter(s => s.day === today && s.type === "focus");

  todayMinutes.textContent = `${state.minutesToday} min`;
  todaySessions.textContent = logs.length;
  todayGoal.textContent = `${state.dailyGoal} min`;

  if (!logs.length) {
    sessionList.innerHTML = `<div class="session-item"><span>No focus sessions yet</span><strong>0 min</strong></div>`;
    return;
  }

  sessionList.innerHTML = logs
    .slice()
    .reverse()
    .map(s => {
      const st = new Date(s.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const et = new Date(s.end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      return `<div class="session-item"><span>${st} - ${et}</span><strong>${s.mins} min</strong></div>`;
    })
    .join("");
}

function renderAnalytics() {
  streakVal.textContent = `${state.streak} 🔥`;
  yesterdayVal.textContent = `${state.minutesYesterday} min`;
  dayBeforeVal.textContent = `${state.minutesDayBefore} min`;
}

function renderProfile() {
  nameInput.value = state.name || "";
  goalInput.value = state.dailyGoal || 60;
  notifToggle.checked = !!state.notifications;
  soundToggle.checked = !!state.sound;
}

function renderAll() {
  rollDayIfNeeded();
  renderTimer();
  renderMotivation();
  renderSessions();
  renderAnalytics();
  renderProfile();

  if (isRunning) timerCard.classList.add("running");
  else timerCard.classList.remove("running");
}

// ---------- Logging ----------
function logSession(mins, type = "focus") {
  if (mins < 1) return;

  const now = new Date();
  state.sessions.push({
    day: todayKey(),
    type,
    start: sessionStartedAt || now.toISOString(),
    end: now.toISOString(),
    mins
  });

  if (type === "focus") {
    state.minutesToday += mins;

    if (state.minutesToday >= state.dailyGoal && !state.goalReachedToday) {
      state.goalReachedToday = true;
      state.streak += 1;
      notify("Daily Goal Achieved 🎉", "Insane consistency. Streak increased!");
    }
  }

  saveState();
}

// ---------- Timer ----------
function onSessionComplete() {
  maybePlay(sfxAlarm);

  if (!isBreakMode) {
    // Focus session complete
    logSession(Math.floor(totalSeconds / 60), "focus");
    notify("Focus Session Complete ✅", "Great work. Time for a short break.");

    if (state.autoBreak) {
      isBreakMode = true;
      setTimerForMode();
      renderAll();
      return;
    }
  } else {
    // Break complete
    logSession(Math.floor(totalSeconds / 60), "break");
    notify("Break Over ⚡", "Back to focus mode.");
    isBreakMode = false;
    setTimerForMode();
    renderAll();
    return;
  }

  // fallback
  isBreakMode = false;
  setTimerForMode();
  renderAll();
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  sessionStartedAt = new Date().toISOString();
  mainBtn.textContent = "Stop";
  timerCard.classList.add("running");
  maybePlay(sfxStart);

  timer = setInterval(() => {
    timeLeft--;
    renderTimer();

    if (timeLeft <= 0) {
      clearInterval(timer);
      isRunning = false;
      mainBtn.textContent = "Start";
      timerCard.classList.remove("running");
      onSessionComplete();
    }
  }, 1000);
}

function stopTimer() {
  if (!isRunning) return;
  clearInterval(timer);
  isRunning = false;
  mainBtn.textContent = "Start";
  timerCard.classList.remove("running");

  const studied = Math.floor((totalSeconds - timeLeft) / 60);
  logSession(studied, isBreakMode ? "break" : "focus");

  // Reset to current mode default duration
  setTimerForMode();
  renderAll();
}

function adjustTime(deltaMinutes) {
  if (isRunning) return;
  let current = Math.floor(timeLeft / 60);
  current += deltaMinutes;
  if (current < 5) current = 5;
  if (current > 180) current = 180;
  timeLeft = current * 60;
  totalSeconds = timeLeft;

  // Also update focus minutes when in focus mode for persistence
  if (!isBreakMode) state.focusMinutes = current;
  saveState();

  renderTimer();
}

// ---------- Events ----------
tabs.forEach(btn => {
  btn.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    btn.classList.add("active");
    const tab = btn.dataset.tab;
    Object.values(views).forEach(v => v.classList.remove("active"));
    views[tab].classList.add("active");
  });
});

mainBtn.addEventListener("click", () => (isRunning ? stopTimer() : startTimer()));
minusBtn.addEventListener("click", () => adjustTime(-5));
plusBtn.addEventListener("click", () => adjustTime(5));

saveProfileBtn.addEventListener("click", async () => {
  state.name = (nameInput.value || "").trim();
  state.dailyGoal = Math.max(5, parseInt(goalInput.value || "60", 10));
  state.notifications = !!notifToggle.checked;
  state.sound = !!soundToggle.checked;

  if (state.notifications && Notification.permission !== "granted") {
    try {
      await Notification.requestPermission();
    } catch {}
  }

  saveState();
  renderAll();
  alert("Profile saved ✅");
});

onboardBtn.addEventListener("click", async () => {
  state.name = (onbName.value || "Commander").trim();
  state.dailyGoal = Math.max(5, parseInt(onbGoal.value || "60", 10));
  state.notifications = !!onbNotif.checked;
  state.lastDate = todayKey();

  if (state.notifications && Notification.permission !== "granted") {
    try {
      await Notification.requestPermission();
    } catch {}
  }

  saveState();
  onboardModal.classList.remove("show");
  renderAll();
});

// PWA install flow
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.classList.remove("hidden");
});

installBtn?.addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.classList.add("hidden");
});

// SW
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}

// ---------- Init ----------
loadState();
if (state.name) onboardModal.classList.remove("show");

// Ensure timer uses saved focus duration
timeLeft = (state.focusMinutes || 25) * 60;
totalSeconds = timeLeft;

renderAll();