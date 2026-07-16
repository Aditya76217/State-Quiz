import * as ui from './ui.js';
import * as api from './api.js';
import { initQuiz, setMode } from './quiz.js';
import { initLeaderboard, loadLeaderboard } from './leaderboard.js';
import { initAuth, checkAuth } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initQuiz();
  initLeaderboard();
  initExplorer();
  initHome();
  initAuth();
  checkAuth();
  initScoreboardDrawer();

  // Initial routing
  handleRoute();
  window.addEventListener('hashchange', handleRoute);
});

function handleRoute() {
  const hash = window.location.hash.slice(1) || 'home';
  const validViews = ['home', 'quiz-setup', 'quiz', 'results', 'explorer', 'leaderboard', 'login'];
  
  if (validViews.includes(hash)) {
    ui.showView(hash);
    if (hash === 'leaderboard') {
      loadLeaderboard();
    } else if (hash === 'explorer') {
      loadExplorer();
    }
  } else {
    window.location.hash = 'home';
  }
}

function initScoreboardDrawer() {
  const panel = document.getElementById('active-players-panel');
  const toggleBtn = document.getElementById('live-scoreboard-toggle');
  const closeBtn = document.getElementById('panel-close-btn');
  const overlay = document.getElementById('scoreboard-overlay');

  if (!panel || !toggleBtn || !closeBtn || !overlay) return;

  const openDrawer = () => {
    panel.classList.add('open');
    overlay.classList.add('active');
    overlay.classList.remove('hidden');
    closeBtn.focus();
  };

  const closeDrawer = () => {
    panel.classList.remove('open');
    overlay.classList.remove('active');
    overlay.classList.add('hidden');
    toggleBtn.focus();
  };

  toggleBtn.addEventListener('click', openDrawer);
  closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  // Close drawer on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('open')) {
      closeDrawer();
    }
  });
}

function initNavigation() {
  const navLinks = document.querySelectorAll('nav a');
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const nav = document.querySelector('nav');

  // Handle nav clicks
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const viewId = link.getAttribute('data-view');
      if (viewId) {
        nav.classList.remove('active');
        mobileMenuBtn?.classList.remove('active');
      }
    });
  });

  // Toggle mobile menu
  mobileMenuBtn?.addEventListener('click', () => {
    const isActive = nav.classList.toggle('active');
    mobileMenuBtn.classList.toggle('active', isActive);
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('active') && !nav.contains(e.target) && !mobileMenuBtn?.contains(e.target)) {
      nav.classList.remove('active');
      mobileMenuBtn?.classList.remove('active');
    }
  });
}

function initHome() {
  const modeCards = document.querySelectorAll('.mode-card');
  modeCards.forEach(card => {
    card.addEventListener('click', () => {
      const mode = card.dataset.mode;
      if (mode === 'explorer') {
        window.location.hash = 'explorer';
      } else if (mode === 'classic' || mode === 'rapid') {
        setMode(mode);
        window.location.hash = 'quiz-setup';
      }
    });

    // Keyboard support
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });
}

let statesCache = null;

async function loadExplorer() {
  const grid = document.getElementById('states-grid');
  if (!grid) return;

  // Only load if cache empty
  if (statesCache) {
    renderStates(statesCache);
    return;
  }

  ui.showLoading();
  try {
    const states = await api.getStates();
    statesCache = states;
    renderStates(states);
    ui.hideLoading();
  } catch (err) {
    ui.hideLoading();
    ui.showToast(err.message || 'Failed to load states', 'error');
  }
}

function renderStates(states) {
  const grid = document.getElementById('states-grid');
  if (!grid) return;

  grid.innerHTML = '';
  if (states.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 2rem;">No states found matching search.</div>`;
    return;
  }

  states.forEach(state => {
    const card = ui.createStateCard(state);
    
    // Open details on click
    card.addEventListener('click', () => showStateDetails(state.id));
    
    // Keyboard support
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        showStateDetails(state.id);
      }
    });

    grid.appendChild(card);
  });
}

async function initExplorer() {
  const searchInput = document.getElementById('explorer-search');
  const modalClose = document.getElementById('modal-close');
  const modal = document.getElementById('state-modal');
  const overlay = modal?.querySelector('.modal-overlay');

  // Search filter with simple debounce
  let timeout = null;
  searchInput?.addEventListener('input', (e) => {
    clearTimeout(timeout);
    timeout = setTimeout(async () => {
      const val = e.target.value.trim();
      ui.showLoading();
      try {
        const results = await api.getStates(val);
        renderStates(results);
        ui.hideLoading();
      } catch (err) {
        ui.hideLoading();
        ui.showToast(err.message || 'Search failed', 'error');
      }
    }, 300);
  });

  // Modal closing
  const closeModal = () => {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    const activeBtn = document.querySelector(`.state-card[data-state-id]`);
    if (activeBtn) activeBtn.focus(); // accessibility return focus
  };

  modalClose?.addEventListener('click', closeModal);
  overlay?.addEventListener('click', closeModal);
  
  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });
}

async function showStateDetails(stateId) {
  const modal = document.getElementById('state-modal');
  const body = document.getElementById('modal-body');
  if (!modal || !body) return;

  ui.showLoading();
  try {
    const state = await api.getState(stateId);
    ui.hideLoading();

    // Populate modal body
    body.innerHTML = `
      <h3 class="modal-title">🇮🇳 ${state.name}</h3>
      <div class="state-meta-grid">
        <div class="meta-item">
          <span class="meta-label">Capital</span>
          <span class="meta-value">${state.capital}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Region</span>
          <span class="meta-value">${state.region}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Language</span>
          <span class="meta-value">${state.official_language || 'N/A'}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Statehood Year</span>
          <span class="meta-value">${state.statehood_year || 'N/A'}</span>
        </div>
      </div>

      ${state.famous_for ? `
        <div class="modal-section">
          <h4>Famous For</h4>
          <p>${state.famous_for}</p>
        </div>
      ` : ''}

      ${state.fun_fact ? `
        <div class="modal-section">
          <h4>Fun Fact</h4>
          <p>💡 ${state.fun_fact}</p>
        </div>
      ` : ''}

      ${state.clues && state.clues.length > 0 ? `
        <div class="modal-section">
          <h4>Educational Clues</h4>
          <ul class="modal-clues-list">
            ${state.clues.map(c => `<li>${c.clue_text} <span class="chip" style="margin-left: 5px; float: right;">${c.clue_type}</span></li>`).join('')}
          </ul>
        </div>
      ` : ''}
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    document.getElementById('modal-close').focus();
    ui.announce(`Details loaded for ${state.name}`);
  } catch (err) {
    ui.hideLoading();
    ui.showToast(err.message || 'Failed to load state details', 'error');
  }
}
