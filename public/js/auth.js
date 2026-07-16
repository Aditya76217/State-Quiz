import * as ui from './ui.js';
import { connectWebSocket, disconnectWebSocket } from './websocket.js';

export let currentUser = null;

export async function checkAuth() {
  try {
    const res = await fetch('/api/auth/me');
    const data = await res.json();
    if (data.user) {
      currentUser = data.user;
      updateAuthUI();
      connectWebSocket();
    } else {
      currentUser = null;
      updateAuthUI();
      disconnectWebSocket();
    }
  } catch (err) {
    currentUser = null;
    updateAuthUI();
    disconnectWebSocket();
  }
}

export function initAuth() {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const toRegisterBtn = document.getElementById('to-register-btn');
  const toLoginBtn = document.getElementById('to-login-btn');
  const loginCard = document.getElementById('login-card');
  const registerCard = document.getElementById('register-card');

  // Register / Login card toggles
  toRegisterBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    loginCard?.classList.add('hidden');
    registerCard?.classList.remove('hidden');
  });

  toLoginBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    registerCard?.classList.add('hidden');
    loginCard?.classList.remove('hidden');
  });

  // Login Form submit
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    ui.showLoading();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      ui.hideLoading();

      if (!res.ok) throw new Error(data.error || 'Login failed');

      currentUser = data.user;
      updateAuthUI();
      connectWebSocket();
      
      ui.showToast(`Welcome back, ${currentUser.username}!`, 'success');
      
      // Clear forms
      loginForm.reset();

      // Redirect to play quiz setup
      window.location.hash = 'quiz-setup';
    } catch (err) {
      ui.hideLoading();
      ui.showToast(err.message, 'error');
    }
  });

  // Register Form submit
  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;

    ui.showLoading();
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      ui.hideLoading();

      if (!res.ok) throw new Error(data.error || 'Registration failed');

      currentUser = data.user;
      updateAuthUI();
      connectWebSocket();

      ui.showToast(`Account created! Welcome, ${currentUser.username}!`, 'success');
      
      // Clear forms
      registerForm.reset();

      // Redirect to play quiz setup
      window.location.hash = 'quiz-setup';
    } catch (err) {
      ui.hideLoading();
      ui.showToast(err.message, 'error');
    }
  });
}

export async function handleLogout() {
  ui.showLoading();
  try {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    ui.hideLoading();
    if (res.ok) {
      currentUser = null;
      updateAuthUI();
      disconnectWebSocket();
      ui.showToast('Logged out successfully', 'info');
      window.location.hash = 'home';
    }
  } catch (err) {
    ui.hideLoading();
    ui.showToast('Logout failed', 'error');
  }
}

function updateAuthUI() {
  const authItem = document.getElementById('nav-auth-item');
  if (!authItem) return;

  if (currentUser) {
    authItem.innerHTML = `<a href="#logout" id="nav-logout-btn">👋 Logout (${currentUser.username})</a>`;
    // Add logout listener
    document.getElementById('nav-logout-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogout();
    });
    
    // Set default name in quiz setup and score save form
    const nameInput = document.getElementById('player-name');
    if (nameInput) nameInput.value = currentUser.username;
    const scoreNameInput = document.getElementById('submit-name');
    if (scoreNameInput) scoreNameInput.value = currentUser.username;
  } else {
    authItem.innerHTML = `<a href="#login" data-view="login">🔑 Login</a>`;
  }
}
