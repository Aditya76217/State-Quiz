const BASE = '/api';

async function request(url, options = {}) {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Something went wrong');
  }
  return res.json();
}

export async function startQuiz(mode, difficulty) {
  return request(`/quiz/start?mode=${mode}&difficulty=${difficulty}`);
}

export async function getQuestion(sessionId) {
  return request(`/quiz/question/${sessionId}`);
}

export async function requestHint(sessionId) {
  return request('/quiz/hint', {
    method: 'POST',
    body: JSON.stringify({ sessionId })
  });
}

export async function submitAnswer(sessionId, answer) {
  return request('/quiz/answer', {
    method: 'POST',
    body: JSON.stringify({ sessionId, answer })
  });
}

export async function getStates(search = '') {
  return request(`/states?search=${encodeURIComponent(search)}`);
}

export async function getState(id) {
  return request(`/states/${id}`);
}

export async function getLeaderboard(mode, limit = 10) {
  return request(`/leaderboard?mode=${mode}&limit=${limit}`);
}

export async function submitScore(playerName, score, gameMode, timeTaken) {
  return request('/scores', {
    method: 'POST',
    body: JSON.stringify({ playerName, score, gameMode, timeTaken })
  });
}
