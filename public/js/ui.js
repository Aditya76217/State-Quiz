export function showView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById(viewId);
  if (target) target.classList.add('active');
  document.querySelectorAll('nav a[data-view]').forEach(a => {
    a.classList.toggle('active', a.getAttribute('data-view') === viewId);
  });
  announce(`Navigated to ${viewId.replace(/-/g, ' ')}`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '\u2705', error: '\u274c', info: '\u2139\ufe0f' };
  toast.innerHTML = `<span>${icons[type] || '\u2139\ufe0f'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

export function announce(message) {
  const el = document.getElementById('aria-announcer');
  if (el) { el.textContent = ''; requestAnimationFrame(() => { el.textContent = message; }); }
}

export function animateScore(element, from, to, duration = 1000) {
  const start = performance.now();
  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.round(from + (to - from) * eased);
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

export function showConfetti() {
  const colors = ['#ff6b2b', '#f8fafc', '#10b981', '#8b5cf6', '#ec4899', '#3b82f6'];
  for (let i = 0; i < 50; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
    piece.style.animationDelay = Math.random() * 0.5 + 's';
    piece.style.width = (Math.random() * 8 + 6) + 'px';
    piece.style.height = (Math.random() * 8 + 6) + 'px';
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 4000);
  }
}

export function showLoading() {
  document.getElementById('loading-overlay')?.classList.remove('hidden');
}

export function hideLoading() {
  document.getElementById('loading-overlay')?.classList.add('hidden');
}

export function createStateCard(state) {
  const card = document.createElement('div');
  card.className = 'state-card';
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `View details about ${state.name}`);
  card.dataset.stateId = state.id;
  card.innerHTML = `
    <div class="state-card-name">${state.name}</div>
    <div class="state-card-capital">Capital: ${state.capital || 'N/A'}</div>
    <div class="state-card-chips">
      ${state.region ? `<span class="chip region">${state.region}</span>` : ''}
      ${state.type ? `<span class="chip">${state.type}</span>` : ''}
    </div>
  `;
  return card;
}

export function shake(element) {
  element.classList.add('wrong');
  setTimeout(() => element.classList.remove('wrong'), 500);
}

export function pulse(element) {
  element.classList.add('correct');
  setTimeout(() => element.classList.remove('correct'), 500);
}

export function typewriter(element, text, speed = 25) {
  element.innerHTML = '';
  return new Promise(resolve => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        const span = document.createElement('span');
        span.className = 'clue-char';
        span.textContent = text[i];
        span.style.animationDelay = `${i * 0.01}s`;
        element.appendChild(span);
        i++;
      } else {
        clearInterval(interval);
        resolve();
      }
    }, speed);
  });
}
