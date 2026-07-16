import * as api from './api.js';
import * as ui from './ui.js';
import { sendGameUpdate } from './websocket.js';

let currentSession = null;
let currentMode = 'classic';
let score = 0;
let questionNum = 0;
let totalQuestions = 10;
let timer = null;
let timeLeft = 0;
let startTime = null;
let results = [];
let hintsUsed = 0;
let maxHints = 3;
let currentQuestion = null;
let isAnswering = false;

const TIMER_DURATION = 15;
const TIMER_CIRCUMFERENCE = 2 * Math.PI * 28;

export function initQuiz() {
  document.getElementById('start-quiz-btn')?.addEventListener('click', () => {
    const difficulty = document.querySelector('input[name="difficulty"]:checked')?.value || 'medium';
    const playerName = document.getElementById('player-name')?.value.trim() || 'Player';
    startGame(currentMode, difficulty, playerName);
  });

  document.getElementById('hint-btn')?.addEventListener('click', requestHint);

  document.getElementById('play-again-btn')?.addEventListener('click', () => {
    ui.showView('home');
    window.location.hash = 'home';
  });

  document.getElementById('submit-score-btn')?.addEventListener('click', submitToLeaderboard);

  document.querySelectorAll('.difficulty-selector label').forEach(label => {
    label.addEventListener('click', () => {
      const radio = document.getElementById(label.getAttribute('for'));
      if (radio) radio.checked = true;
    });
  });
}

export function setMode(mode) {
  currentMode = mode;
  const titleEl = document.getElementById('setup-mode-title');
  if (titleEl) {
    const titles = { classic: '\ud83c\udfaf Classic Quiz', rapid: '\u26a1 Rapid Fire' };
    titleEl.textContent = titles[mode] || 'Quiz Setup';
  }
}

export async function startGame(mode, difficulty, playerName) {
  try {
    ui.showLoading();
    const data = await api.startQuiz(mode, difficulty);
    currentSession = data.sessionId;
    currentMode = mode;
    score = 0;
    questionNum = 0;
    totalQuestions = data.totalQuestions || 10;
    results = [];
    hintsUsed = 0;
    isAnswering = false;
    startTime = Date.now();
    window.__quizPlayerName = playerName;

    document.getElementById('quiz-score').textContent = 'Score: 0';
    document.getElementById('progress-bar').style.width = '0%';

    const timerContainer = document.getElementById('timer-container');
    if (timerContainer) {
      timerContainer.style.display = mode === 'rapid' ? 'block' : 'none';
    }

    ui.showView('quiz');
    ui.hideLoading();
    await loadQuestion();
    sendGameUpdate(0, 1, mode);
  } catch (err) {
    ui.hideLoading();
    ui.showToast(err.message || 'Failed to start quiz', 'error');
  }
}

async function loadQuestion() {
  if (!currentSession) return;
  try {
    const data = await api.getQuestion(currentSession);
    if (data.gameOver) { showResults(); return; }

    currentQuestion = data;
    questionNum = data.questionNumber || questionNum + 1;
    isAnswering = false;
    sendGameUpdate(score, questionNum, currentMode);

    document.getElementById('question-counter').textContent = `Question ${questionNum}/${totalQuestions}`;
    document.getElementById('progress-bar').style.width = `${(questionNum / totalQuestions) * 100}%`;
    document.getElementById('hint-clues').innerHTML = '';
    document.getElementById('fun-fact').style.display = 'none';
    document.getElementById('fun-fact').textContent = '';

    const typeBadge = document.getElementById('clue-type-badge');
    if (typeBadge) {
      const typeIcons = {
        culture: '🎭 Culture Clue',
        food: '🍛 Cuisine Clue',
        geography: '🏔️ Geography Clue',
        landmark: '🏛️ Landmark Clue',
        history: '📜 History Clue',
        language: '🗣️ Language Clue',
        festival: '🎉 Festival Clue',
        wildlife: '🐅 Wildlife Clue'
      };
      typeBadge.textContent = typeIcons[data.clueType] || '❓ Clue';
      typeBadge.className = `clue-badge ${data.clueType || ''}`;
    }

    const hintBtn = document.getElementById('hint-btn');
    hintsUsed = 0;
    hintBtn.disabled = false;
    hintBtn.textContent = `💡 Get a Hint (${maxHints} left)`;

    const clueText = document.getElementById('clue-text');
    await ui.typewriter(clueText, data.clue || data.question || 'No clue available');
    renderOptions(data.options || []);

    if (currentMode === 'rapid') startTimer(TIMER_DURATION);
    ui.announce(`Question ${questionNum} of ${totalQuestions}`);
  } catch (err) {
    ui.showToast(err.message || 'Failed to load question', 'error');
  }
}

function renderOptions(options) {
  const grid = document.getElementById('options-grid');
  grid.innerHTML = '';
  options.forEach(option => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = option;
    btn.addEventListener('click', () => handleAnswer(option));
    grid.appendChild(btn);
  });
}

async function handleAnswer(answer) {
  if (isAnswering) return;
  isAnswering = true;
  if (timer) { clearInterval(timer); timer = null; }

  const buttons = document.querySelectorAll('#options-grid .option-btn');
  buttons.forEach(btn => btn.disabled = true);

  try {
    const data = await api.submitAnswer(currentSession, answer);
    const isCorrect = data.correct;

    buttons.forEach(btn => {
      if (btn.textContent === data.correctAnswer) {
        btn.classList.add('correct');
        ui.pulse(btn);
      }
      if (btn.textContent === answer && !isCorrect) {
        btn.classList.add('wrong');
        ui.shake(btn);
      }
    });

    if (isCorrect) {
      const oldScore = score;
      score = data.totalScore || score + 1;
      ui.animateScore(document.getElementById('quiz-score'), oldScore, score, 500);
      document.getElementById('quiz-score').textContent = `Score: ${score}`;
      ui.showConfetti();
    }

    sendGameUpdate(score, questionNum, currentMode);

    results.push({
      question: currentQuestion?.clue || currentQuestion?.question || '',
      answer, correctAnswer: data.correctAnswer, correct: isCorrect
    });

    if (data.funFact) {
      const funFact = document.getElementById('fun-fact');
      funFact.textContent = `\ud83d\udca1 ${data.funFact}`;
      funFact.style.display = 'block';
    }

    setTimeout(async () => {
      if (data.gameOver || questionNum >= totalQuestions) showResults();
      else await loadQuestion();
    }, isCorrect ? 1500 : 2000);
  } catch (err) {
    ui.showToast(err.message || 'Failed to submit answer', 'error');
    isAnswering = false;
    buttons.forEach(btn => btn.disabled = false);
  }
}

async function requestHint() {
  if (!currentSession || hintsUsed >= maxHints) return;
  try {
    const data = await api.requestHint(currentSession);
    hintsUsed++;
    const hintClues = document.getElementById('hint-clues');
    const hintDiv = document.createElement('div');
    hintDiv.className = 'hint-clue';
    const typeIcons = {
      culture: '🎭',
      food: '🍛',
      geography: '🏔️',
      landmark: '🏛️',
      history: '📜',
      language: '🗣️',
      festival: '🎉',
      wildlife: '🐅'
    };
    const icon = typeIcons[data.clueType] || '💡';
    hintDiv.innerHTML = `<span class="hint-icon">${icon}</span> <span class="hint-text">${data.clue || data.hint || 'No additional hint available'}</span>`;
    hintClues.appendChild(hintDiv);

    const hintBtn = document.getElementById('hint-btn');
    const remaining = maxHints - hintsUsed;
    hintBtn.disabled = remaining <= 0;
    hintBtn.textContent = remaining <= 0 ? '💡 No Hints Left' : `💡 Get a Hint (${remaining} left)`;
    ui.announce(`Hint revealed. ${remaining} hints remaining.`);
  } catch (err) {
    ui.showToast(err.message || 'Failed to get hint', 'error');
  }
}

function startTimer(seconds) {
  timeLeft = seconds;
  const timerRing = document.getElementById('timer-ring');
  const timerContainer = document.getElementById('timer-container');
  if (timerRing) { timerRing.style.strokeDasharray = TIMER_CIRCUMFERENCE; timerRing.style.strokeDashoffset = 0; }
  updateTimerDisplay();

  timer = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timerRing) timerRing.style.strokeDashoffset = TIMER_CIRCUMFERENCE * (1 - timeLeft / seconds);
    if (timerContainer) timerContainer.classList.toggle('urgent', timeLeft <= 5);
    if (timeLeft <= 0) { clearInterval(timer); timer = null; handleAnswer('__timeout__'); }
  }, 1000);
}

function updateTimerDisplay() {
  const el = document.getElementById('timer-text');
  if (el) el.textContent = timeLeft;
}

function showResults() {
  if (timer) { clearInterval(timer); timer = null; }
  sendGameUpdate(score, questionNum, 'idle');
  const timeTaken = Math.round((Date.now() - startTime) / 1000);
  const correct = results.filter(r => r.correct).length;
  const wrong = results.filter(r => !r.correct).length;
  const avgTime = results.length > 0 ? Math.round(timeTaken / results.length) : 0;

  ui.showView('results');
  ui.animateScore(document.getElementById('final-score'), 0, score, 1500);
  ui.animateScore(document.getElementById('stat-correct'), 0, correct, 1000);
  ui.animateScore(document.getElementById('stat-wrong'), 0, wrong, 1000);
  document.getElementById('stat-avg-time').textContent = `${avgTime}s`;

  const breakdown = document.getElementById('results-breakdown');
  breakdown.innerHTML = '<h3>Question Breakdown</h3>';
  results.forEach((r, i) => {
    const item = document.createElement('div');
    item.className = `breakdown-item ${r.correct ? 'correct-item' : 'wrong-item'}`;
    item.innerHTML = `<span>Q${i + 1}: ${r.correctAnswer}</span><span>${r.correct ? '\u2705' : '\u274c'}</span>`;
    breakdown.appendChild(item);
  });

  const submitName = document.getElementById('submit-name');
  if (submitName && window.__quizPlayerName) submitName.value = window.__quizPlayerName;
  window.__quizResults = { score, gameMode: currentMode, timeTaken };
  if (correct >= totalQuestions * 0.7) ui.showConfetti();
  ui.announce(`Quiz complete! You scored ${score} points with ${correct} correct answers.`);
}

async function submitToLeaderboard() {
  const name = document.getElementById('submit-name')?.value.trim();
  if (!name) { ui.showToast('Please enter your name', 'error'); return; }
  const { score: finalScore, gameMode, timeTaken } = window.__quizResults || {};
  try {
    const data = await api.submitScore(name, finalScore, gameMode, timeTaken);
    ui.showToast(`Score submitted! ${data.rank ? `You ranked #${data.rank}!` : 'Great job!'}`, 'success');
    document.getElementById('submit-score-btn').disabled = true;
    document.getElementById('submit-score-btn').textContent = 'Submitted \u2713';
  } catch (err) {
    ui.showToast(err.message || 'Failed to submit score', 'error');
  }
}
