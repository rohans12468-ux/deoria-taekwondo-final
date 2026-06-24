/* ════════════════════════════════════════════════════════════
   CHATBOT.JS — "Coach AI" chat widget
   ════════════════════════════════════════════════════════════
   HOW THIS IS SECURE:
   This file does NOT contain any AI API key. Instead, when the
   visitor sends a message, this file calls our OWN backend
   address: "/.netlify/functions/chat".

   That backend (see netlify/functions/chat.js) is the ONLY
   place the real Gemini key lives — stored as a secret
   "environment variable" on Netlify, never visible to visitors,
   never pushed to GitHub.

   Flow:  Visitor types -> this file -> our backend -> Google AI
          -> our backend -> this file -> shown in the chat box
   ════════════════════════════════════════════════════════════ */

// Address of our own secure backend function (see README.md for setup)
const CHAT_API_URL = "/.netlify/functions/chat";

let cbLang = null;      // 'hinglish' or 'english'
let cbHistory = [];     // the back-and-forth conversation, sent each time for context
let cbBusy = false;     // true while waiting for a reply (stops double-sends)
let panelOpen = false;

const fab = document.getElementById('chatFab');
const panel = document.getElementById('chatPanel');
const msgs = document.getElementById('cpMessages');
const cbInput = document.getElementById('cbInput');
const cbSend = document.getElementById('cbSend');

fab.addEventListener('click', () => togglePanel(true));
document.getElementById('cpClose').addEventListener('click', () => togglePanel(false));

function togglePanel(open) {
  panelOpen = open;
  panel.classList.toggle('open', open);
  fab.style.animation = open ? 'none' : '';
  if (open && !cbLang) renderLangSelect();
}

/* ---------- LANGUAGE SWITCH BUTTON (top right of chat panel) ---------- */
document.getElementById('cpLangBtn').addEventListener('click', () => {
  if (!cbLang) return;
  cbLang = cbLang === 'hinglish' ? 'english' : 'hinglish';
  updateLangBtn();
  const note = document.createElement('div');
  note.className = 'lang-note';
  note.textContent = cbLang === 'hinglish' ? '🇮🇳 Ab main Hinglish mein baat karunga!' : '🇬🇧 Switched to English!';
  msgs.appendChild(note);
  scrollMsgs();
});

function updateLangBtn() {
  document.getElementById('cpLangBtn').innerHTML = cbLang === 'hinglish'
    ? '🇮🇳 Hinglish <i class="fas fa-sync-alt" style="font-size:8px;margin-left:2px;"></i>'
    : '🇬🇧 English <i class="fas fa-sync-alt" style="font-size:8px;margin-left:2px;"></i>';
}

/* ---------- Quick-reply suggestion chips ---------- */
const CHIPS = {
  hinglish: ['🍎 Diet plan batao', '⚡ Kick improve karo', '🏅 Belt grading', '🩹 Injury prevention', '🌍 Olympic qualification', '💪 Training routine'],
  english: ['🍎 Athlete diet plan', '⚡ Improve my kicks', '🏅 Belt grading tips', '🩹 Injury prevention', '🌍 Olympic qualification', '💪 Training schedule']
};

function getTime() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

/* ---------- First screen: choose a language ---------- */
function renderLangSelect() {
  msgs.innerHTML = '';
  const screen = document.createElement('div');
  screen.className = 'lang-select-screen';
  screen.innerHTML = `
    <div class="ls-emoji">🥋</div>
    <div class="ls-title">WELCOME TO COACH AI</div>
    <div class="ls-sub">Your personal Taekwondo & sports guide. Choose your language:</div>
    <div class="ls-options">
      <div class="ls-opt" id="pickHinglish"><span class="lsflag">🇮🇳</span><span class="lsname">Hinglish</span><span class="lsdesc">Hindi + English</span></div>
      <div class="ls-opt" id="pickEnglish"><span class="lsflag">🇬🇧</span><span class="lsname">English</span><span class="lsdesc">Full English</span></div>
    </div>`;
  msgs.appendChild(screen);
 document.getElementById('pickHinglish').onclick = (e) => {
  e.preventDefault();
  e.stopPropagation();
  startChat('hinglish');
};

document.getElementById('pickEnglish').onclick = (e) => {
  e.preventDefault();
  e.stopPropagation();
  startChat('english');
};
}

function startChat(lang) {
 
  panel.classList.add('open');
  panelOpen = true;

  cbLang = lang;
  cbHistory = [];
  
  updateLangBtn();
  cbInput.disabled = false;
  cbSend.disabled = false;
  cbInput.focus();
  msgs.innerHTML = '';
  const welcome = lang === 'hinglish'
    ? `<strong>Kem Cho Champion!</strong> 🥋 Main hoon <strong>Coach AI</strong> — Deoria Taekwondo Academy ka virtual coach!<br><br>Taekwondo, diet, fitness, injuries, competitions — koi bhi sports sawaal poocho. <em>Let's train! 💪</em>`
    : `<strong>Welcome, Champion!</strong> 🥋 I'm <strong>Coach AI</strong> — virtual coach of Deoria Taekwondo Academy.<br><br>Ask me anything about Taekwondo, diet, fitness, injuries, competitions. <em>Let's train! 💪</em>`;
  appendBotMsg(welcome);
  renderChips();
}

function appendBotMsg(html) {
  const row = document.createElement('div');
  row.className = 'msg-row';
  row.innerHTML = `<div class="msg-av">🥋</div><div class="bubble bot-b">${html}<span class="btime">${getTime()}</span></div>`;
  msgs.appendChild(row);
  scrollMsgs();
}
function appendUserMsg(text) {
  const row = document.createElement('div');
  row.className = 'msg-row user';
  row.innerHTML = `<div class="msg-av">👤</div><div class="bubble user-b">${esc(text)}<span class="btime">${getTime()}</span></div>`;
  msgs.appendChild(row);
  scrollMsgs();
}
function renderChips() {
  const row = document.createElement('div');
  row.className = 'cp-chips';
  row.id = 'cpChips';
  CHIPS[cbLang].forEach((label) => {
    const chip = document.createElement('button');
    chip.className = 'cp-chip';
    chip.textContent = label;
    chip.onclick = () => {
      row.remove();
      handleSend(label.replace(/^[^\w\u0900-\u097F]+/, '').trim());
    };
    row.appendChild(chip);
  });
  msgs.appendChild(row);
  scrollMsgs();
}
function showTyping() {
  removeTyping();
  const row = document.createElement('div');
  row.className = 'typing-row';
  row.id = 'cbTyping';
  row.innerHTML = `<div class="msg-av">🥋</div><div class="typing-bub"><div class="tdot"></div><div class="tdot"></div><div class="tdot"></div></div>`;
  msgs.appendChild(row);
  scrollMsgs();
}
function removeTyping() {
  const typingRow = document.getElementById('cbTyping');
  if (typingRow) typingRow.remove();
}
function scrollMsgs() {
  setTimeout(() => { msgs.scrollTop = msgs.scrollHeight; }, 60);
}
function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
// Turns the AI's plain-text reply (with **bold**, bullet points, etc.) into safe HTML
function md2html(t) {
  return t
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^#{1,3} (.+)$/gm, '<strong style="display:block;margin-top:8px;color:#f0b429">$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/g, (m) => `<ul>${m}</ul>`)
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

/* ---------- Talks to OUR backend (not Google directly) ---------- */
async function askCoachAI(userMsg) {
  cbHistory.push({ role: 'user', parts: [{ text: userMsg }] });

  const res = await fetch(CHAT_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lang: cbLang,        // tells the backend which language/system-prompt to use
      history: cbHistory   // full conversation so far, for context
    })
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || 'Something went wrong reaching Coach AI');
  }

  const data = await res.json();
  const reply = data.reply || '';
  cbHistory.push({ role: 'model', parts: [{ text: reply }] });
  return reply;
}

async function handleSend(forcedText) {
  const text = (forcedText || cbInput.value).trim();
  if (!text || cbBusy || !cbLang) return;

  cbInput.value = '';
  cbInput.style.height = 'auto';
  const chips = document.getElementById('cpChips');
  if (chips) chips.remove();

  appendUserMsg(text);
  cbBusy = true;
  cbSend.disabled = true;
  showTyping();

  try {
    const reply = await askCoachAI(text);
    removeTyping();
    appendBotMsg(md2html(reply));
    if (cbHistory.length % 6 === 0) renderChips();
  } catch (err) {
    removeTyping();
    appendBotMsg(`❌ <em>${esc(err.message)}</em> — Please try again.`);
  } finally {
    cbBusy = false;
    cbSend.disabled = false;
    cbInput.focus();
  }
}

cbSend.addEventListener('click', () => handleSend());
cbInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
});
cbInput.addEventListener('input', () => {
  cbInput.style.height = 'auto';
  cbInput.style.height = Math.min(cbInput.scrollHeight, 100) + 'px';
});
// Close the chat panel if the visitor clicks anywhere outside it
document.addEventListener('click', (e) => {
  if (panelOpen && !panel.contains(e.target) && !fab.contains(e.target)) togglePanel(false);
});
