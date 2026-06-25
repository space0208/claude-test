// ===== STATE =====
const profile = {};
let currentScreen = 0;
const totalSteps = 6;

// ===== UNIVERSITY DATABASE =====
const universities = {
  good: [
    { name: "Gettysburg College", note: "Need-aware, Liberal Arts, PA", aid: "Generous merit aid" },
    { name: "Denison University", note: "Ohio, strong community", aid: "Up to $38k/yr merit" },
    { name: "Trinity University", note: "Texas, STEM+Liberal Arts", aid: "Full merit scholarships" },
    { name: "University of Tulsa", note: "Oklahoma, research focus", aid: "Full ride available" },
    { name: "Hendrix College", note: "Arkansas, small & personal", aid: "Strong international aid" },
    { name: "Augustana College", note: "Illinois, internship-ready", aid: "Merit up to $30k/yr" },
    { name: "Drury University", note: "Missouri, low cost", aid: "International scholarships" },
    { name: "Ohio Wesleyan University", note: "Ohio, global focus", aid: "Up to $36k/yr" },
  ],
  competitive: [
    { name: "University of Rochester", note: "New York, top research", aid: "Strong scholarship prog." },
    { name: "Case Western Reserve", note: "Ohio, STEM powerhouse", aid: "Merit + need-based" },
    { name: "Tulane University", note: "Louisiana, vibrant campus", aid: "Tulane Scholars Award" },
    { name: "University of Miami", note: "Florida, diverse & sunny", aid: "Stamps Scholarship" },
    { name: "Boston University", note: "Massachusetts, global hub", aid: "Trustee Scholarship" },
    { name: "University of Vermont", note: "Need-blind for intl?", aid: "Davis Scholarship" },
    { name: "American University", note: "DC, policy & intl focus", aid: "Emerging Global Leader" },
    { name: "Clark University", note: "Tuition-free 5th year!", aid: "International grants" },
  ],
  elite: [
    { name: "Harvard University", note: "Cambridge, MA — #1", aid: "Need-blind, full aid" },
    { name: "MIT", note: "Cambridge, MA — STEM king", aid: "Need-blind intl students" },
    { name: "Yale University", note: "New Haven, CT", aid: "Need-blind, no loans" },
    { name: "Princeton University", note: "New Jersey", aid: "Best aid in the world" },
    { name: "Stanford University", note: "Palo Alto, CA", aid: "Family income <65k → free" },
    { name: "Columbia University", note: "New York City", aid: "Need-blind for intl" },
    { name: "Duke University", note: "North Carolina", aid: "Robertson Scholars" },
    { name: "University of Chicago", note: "Illinois, intellectual hub", aid: "No-loan policy" },
  ]
};

// ===== NAVIGATION =====
function goTo(nextId) {
  const current = document.getElementById(
    currentScreen === 0 ? 'screen-0' : `screen-${currentScreen}`
  );
  const target = document.getElementById(
    nextId === 'result' ? 'screen-result' : `screen-${nextId}`
  );

  if (!target) return;

  current.classList.add('exit');
  setTimeout(() => {
    current.classList.remove('active', 'exit');
  }, 450);

  target.classList.add('active');

  if (nextId === 'result') {
    currentScreen = 'result';
    renderResult();
  } else {
    currentScreen = nextId;
  }

  updateProgress();

  // Show/hide back button
  document.getElementById('backBtn').style.display =
    (nextId === 1 || nextId === 0) ? 'none' : 'flex';
}

function goBack() {
  if (currentScreen === 'result') { goToScreen(6); return; }
  if (currentScreen <= 1) return;
  const prev = currentScreen - 1;
  const current = document.getElementById(`screen-${currentScreen}`);
  const target = document.getElementById(`screen-${prev}`);

  current.style.transform = 'translateX(60px)';
  current.style.opacity = '0';
  setTimeout(() => {
    current.classList.remove('active');
    current.style.transform = '';
    current.style.opacity = '';
  }, 300);

  // Reverse animate
  target.style.transform = 'translateX(-60px)';
  target.style.opacity = '0';
  target.classList.add('active');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      target.style.transition = 'opacity 0.35s, transform 0.35s';
      target.style.transform = '';
      target.style.opacity = '';
      setTimeout(() => { target.style.transition = ''; }, 400);
    });
  });

  currentScreen = prev;
  updateProgress();
  document.getElementById('backBtn').style.display =
    currentScreen <= 1 ? 'none' : 'flex';
}

function pick(el, screenNum, nextScreen) {
  // Deselect siblings
  const siblings = el.parentElement.querySelectorAll('.choice-card, .choice-card-wide');
  siblings.forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');

  // Save to profile
  profile[el.dataset.key] = el.dataset.val;

  // Small delay for visual feedback, then advance
  setTimeout(() => goTo(nextScreen), 200);
}

function updateProgress() {
  const wrap = document.getElementById('progressWrap');
  const fill = document.getElementById('progressFill');
  const label = document.getElementById('progressLabel');

  if (currentScreen === 0) {
    wrap.classList.remove('visible');
    return;
  }

  wrap.classList.add('visible');

  const step = currentScreen === 'result' ? totalSteps : currentScreen;
  const pct = (step / totalSteps) * 100;
  fill.style.width = pct + '%';
  label.textContent = `${step} / ${totalSteps}`;
}

// ===== SCORING =====
function calcScore() {
  let score = 0;
  // English
  if (profile.english === 'advanced') score += 30;
  else if (profile.english === 'intermediate') score += 18;
  else if (profile.english === 'ielts_no') score += 8;
  else score += 0;
  // SAT
  if (profile.sat === '1500') score += 30;
  else if (profile.sat === '1400') score += 22;
  else if (profile.sat === '1200') score += 12;
  else score += 0;
  // Activities
  if (profile.activities === 'many') score += 25;
  else if (profile.activities === 'few') score += 12;
  else score += 0;
  // Grade bonus
  if (profile.grade === '11' || profile.grade === 'gap') score += 15;
  else if (profile.grade === '10') score += 10;
  else score += 5;

  return Math.min(score, 100);
}

function scoreToLevel(score) {
  if (score >= 70) return 'elite';
  if (score >= 40) return 'competitive';
  return 'good';
}

function getLevelLabel(level) {
  const map = {
    good: { emoji: '🟢', text: 'Good', cls: 'green' },
    competitive: { emoji: '🟡', text: 'Competitive', cls: 'yellow' },
    elite: { emoji: '🔴', text: 'Elite', cls: 'red' },
  };
  return map[level] || map.good;
}

// ===== ADVICE ENGINE =====
function getAdvice() {
  const tips = [];

  if (profile.english === 'none' || profile.english === 'ielts_no') {
    tips.push('IELTS yoki TOEFL tayyorgarligini boshlang — minimal 6.5 ball kerak');
  }
  if (profile.english === 'intermediate') {
    tips.push('IELTS 7.0+ ga yetish uchun kundalik ingliz tili amaliyoti zarur');
  }
  if (profile.sat === 'none') {
    tips.push('Khan Academy orqali bepul SAT tayyorgarligini boshlang');
  }
  if (profile.sat === '1200') {
    tips.push('SAT 1400+ ga yetish uchun math va reading seксiyalarini mustahkamlang');
  }
  if (profile.activities === 'none') {
    tips.push('Olimpiadalar, klub yoki ijtimoiy loyihalarga qo\'shiling — activities muhim!');
  }
  if (profile.goal === 'full') {
    tips.push('Full Ride uchun need-blind kollejlarni tanlang: Amherst, Dartmouth, MIT');
  }
  if (profile.grade === '8' || profile.grade === '9') {
    tips.push('Vaqt bor! Erta boshlash — eng katta afzalligingiz');
  }
  if (tips.length === 0) {
    tips.push('Profilingiz yaxshi! Essays va recommendation letters ga e\'tibor bering');
    tips.push('Common App yoki Coalition App akkountini oching');
  }
  return tips.slice(0, 4);
}

// ===== RENDER RESULT =====
function renderResult() {
  const score = calcScore();
  const currentLevel = scoreToLevel(score);
  const dreamLevel = profile.dream || 'competitive';
  const lCurrent = getLevelLabel(currentLevel);
  const lDream = getLevelLabel(dreamLevel);
  const advice = getAdvice();

  // Pick universities: show dream level + one tier below
  const dreamUnis = universities[dreamLevel].slice(0, 3);
  const safeLevel = dreamLevel === 'elite' ? 'competitive' : dreamLevel === 'competitive' ? 'good' : 'good';
  const safeUnis = universities[safeLevel].slice(0, 3);

  const pct = score;
  const fillClass = lCurrent.cls;

  document.getElementById('result-content').innerHTML = `
    <div class="result-header">
      <p class="result-label">Sizning profilingiz</p>
      <h1 class="result-title">Natija tayyor 🎓</h1>
    </div>

    <div class="profile-match">
      <div class="match-row">
        <span class="match-label">Hozirgi daraja</span>
        <span class="match-badge badge-${fillClass}">${lCurrent.emoji} ${lCurrent.text}</span>
      </div>
      <div class="match-track">
        <div class="match-fill ${fillClass}" id="matchFill" style="width:0%"></div>
      </div>
      <div class="match-row" style="margin-top:8px;margin-bottom:0">
        <span class="match-desc">Maqsad: ${lDream.emoji} ${lDream.text}</span>
        <span class="match-desc">${score}/100 ball</span>
      </div>
    </div>

    <div class="advice-block">
      <h4>⚡ Keyingi qadamlaringiz</h4>
      <ul>
        ${advice.map(tip => `<li>${tip}</li>`).join('')}
      </ul>
    </div>

    <div class="uni-section">
      <h3>${lDream.emoji} ${lDream.text} — Dream List</h3>
      <div class="uni-list">
        ${dreamUnis.map((u, i) => `
          <div class="uni-card">
            <span class="uni-rank">${i + 1}</span>
            <div class="uni-info">
              <strong>${u.name}</strong>
              <span>${u.note} · ${u.aid}</span>
            </div>
            <div class="uni-dot dot-${lDream.cls}"></div>
          </div>
        `).join('')}
      </div>

      <h3>🟢 Safe Schools</h3>
      <div class="uni-list">
        ${safeUnis.map((u, i) => `
          <div class="uni-card">
            <span class="uni-rank">${i + 1}</span>
            <div class="uni-info">
              <strong>${u.name}</strong>
              <span>${u.note} · ${u.aid}</span>
            </div>
            <div class="uni-dot dot-green"></div>
          </div>
        `).join('')}
      </div>
    </div>

    <button class="btn-restart" onclick="restart()">🔄 Qaytadan boshlash</button>
  `;

  // Animate the fill bar after render
  setTimeout(() => {
    const fill = document.getElementById('matchFill');
    if (fill) fill.style.width = pct + '%';
  }, 100);
}

// ===== RESTART =====
function restart() {
  // Reset all selections
  document.querySelectorAll('.choice-card, .choice-card-wide').forEach(el => {
    el.classList.remove('selected');
  });
  Object.keys(profile).forEach(k => delete profile[k]);

  // Reset screens
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active', 'exit');
    s.style.transform = '';
    s.style.opacity = '';
  });

  currentScreen = 0;
  document.getElementById('screen-0').classList.add('active');
  document.getElementById('progressWrap').classList.remove('visible');
  document.getElementById('backBtn').style.display = 'none';
}

// ===== INIT =====
document.getElementById('backBtn').style.display = 'none';
