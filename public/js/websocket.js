import { currentUser } from './auth.js';

let ws = null;
let currentGameState = { score: 0, questionNumber: 0, mode: 'idle' };

export function connectWebSocket() {
  if (ws || !currentUser) return;

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws`;

  try {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Real-time score connection established');
      // Show sidebar panel and toggle button
      const panel = document.getElementById('active-players-panel');
      if (panel) panel.classList.remove('hidden');
      const toggleBtn = document.getElementById('live-scoreboard-toggle');
      if (toggleBtn) toggleBtn.classList.remove('hidden');
      
      // Send current state immediately
      sendGameUpdate(currentGameState.score, currentGameState.questionNumber, currentGameState.mode);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'ACTIVE_PLAYERS_LIST') {
          renderActivePlayers(data.players);
        }
      } catch (err) {
        console.error('Error parsing WS message:', err);
      }
    };

    ws.onclose = () => {
      console.log('Real-time score connection closed');
      handleDisconnect();
    };

    ws.onerror = (err) => {
      console.error('WS connection error:', err);
      ws.close();
    };
  } catch (err) {
    console.error('Failed to initialize WebSocket:', err);
  }
}

export function disconnectWebSocket() {
  if (ws) {
    ws.close();
    ws = null;
  }
  handleDisconnect();
}

function handleDisconnect() {
  const panel = document.getElementById('active-players-panel');
  if (panel) {
    panel.classList.add('hidden');
    panel.classList.remove('open');
  }
  const toggleBtn = document.getElementById('live-scoreboard-toggle');
  if (toggleBtn) {
    toggleBtn.classList.add('hidden');
  }
  const overlay = document.getElementById('scoreboard-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    overlay.classList.add('hidden');
  }
  const list = document.getElementById('active-players-list');
  if (list) list.innerHTML = '';
}

/**
 * Sends a real-time game progress update to the WebSocket server.
 * @param {number} score - Current user score
 * @param {number} questionNumber - Current question index
 * @param {string} mode - Active game mode ('classic', 'rapid', or 'idle')
 */
export function sendGameUpdate(score, questionNumber, mode) {
  currentGameState = { score, questionNumber, mode };
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'GAME_UPDATE',
      score,
      questionNumber,
      mode
    }));
  }
}

function renderActivePlayers(players) {
  const container = document.getElementById('active-players-list');
  if (!container) return;

  container.innerHTML = '';

  // Sort players by score desc
  const sorted = [...players].sort((a, b) => b.score - a.score);

  sorted.forEach(player => {
    const row = document.createElement('div');
    row.className = 'active-player-row';
    
    let statusText = 'Idle';
    if (player.mode === 'classic') {
      statusText = `Classic Q${player.questionNumber}`;
    } else if (player.mode === 'rapid') {
      statusText = `Rapid Q${player.questionNumber}`;
    }

    // Highlight self
    const isSelf = currentUser && player.username === currentUser.username;
    const displayName = isSelf ? `${player.username} (You)` : player.username;

    row.innerHTML = `
      <div class="player-info">
        <span class="player-username" style="${isSelf ? 'color: var(--accent-saffron);' : ''}">${escapeHTML(displayName)}</span>
        <span class="player-status-text">${statusText}</span>
      </div>
      <span class="player-live-score">${player.score}</span>
    `;
    container.appendChild(row);
  });
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
