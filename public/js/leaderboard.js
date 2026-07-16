import * as api from './api.js';
import * as ui from './ui.js';

let currentMode = 'classic';

export function initLeaderboard() {
  const tabs = document.querySelectorAll('.leaderboard-tabs .tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', async () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentMode = tab.dataset.mode || 'classic';
      await loadLeaderboard(currentMode);
    });
  });
}

export async function loadLeaderboard(mode = 'classic') {
  currentMode = mode;
  const tbody = document.getElementById('leaderboard-body');
  if (!tbody) return;

  tbody.innerHTML = '';
  ui.showLoading();

  try {
    const scores = await api.getLeaderboard(mode, 15);
    ui.hideLoading();

    if (scores.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td colspan="5" style="text-align: center; color: var(--text-secondary);">No scores yet. Be the first to submit!</td>`;
      tbody.appendChild(tr);
      return;
    }

    scores.forEach((entry, index) => {
      const tr = document.createElement('tr');
      tr.style.animationDelay = `${index * 50}ms`;

      let rankDisplay = index + 1;
      if (index === 0) rankDisplay = '<span class="medal">🥇</span>';
      else if (index === 1) rankDisplay = '<span class="medal">🥈</span>';
      else if (index === 2) rankDisplay = '<span class="medal">🥉</span>';

      const timeDisplay = entry.time_taken ? `${entry.time_taken}s` : 'N/A';
      const dateDisplay = new Date(entry.created_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      tr.innerHTML = `
        <td>${rankDisplay}</td>
        <td style="font-weight: 500;">${escapeHTML(entry.player_name)}</td>
        <td style="color: var(--accent-saffron); font-weight: 600;">${entry.score}</td>
        <td>${timeDisplay}</td>
        <td style="color: var(--text-muted); font-size: 0.9rem;">${dateDisplay}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    ui.hideLoading();
    ui.showToast(err.message || 'Failed to load leaderboard', 'error');
  }
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
