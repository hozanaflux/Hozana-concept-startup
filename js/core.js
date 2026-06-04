/* ============================================================
   Hozana Concept - CORE JavaScript v2.0
   Cursor, Particles, ScrollReveal, Counters, Loader, Toast
   ============================================================ */

'use strict';

// ============================================================
// CUSTOM CURSOR
// ============================================================
function initCursor() {
  if (window.innerWidth <= 1024) return;

  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  if (!cursor || !follower) return;

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;
  let raf;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
  }, { passive: true });

  function animateFollower() {
    followerX += (mouseX - followerX) * 0.1;
    followerY += (mouseY - followerY) * 0.1;
    follower.style.left = followerX + 'px';
    follower.style.top  = followerY + 'px';
    raf = requestAnimationFrame(animateFollower);
  }
  animateFollower();

  // Hover effect on interactive elements
  const hoverSet = new WeakSet();
  const addHover = () => {
    try {
      document.querySelectorAll('a, button, .btn, [role="button"], .card, .article-card, .related-card').forEach(el => {
        if (hoverSet.has(el)) return;
        hoverSet.add(el);
        el.addEventListener('mouseenter', () => { cursor.classList.add('hover'); follower.classList.add('hover'); }, { passive: true });
        el.addEventListener('mouseleave', () => { cursor.classList.remove('hover'); follower.classList.remove('hover'); }, { passive: true });
      });
    } catch(e) {}
  };
  addHover();

  // Re-run on dynamic content
  const mo = new MutationObserver(addHover);
  mo.observe(document.body, { childList: true, subtree: true });
}

// ============================================================
// GLASS DYNAMIC EFFECT (mouse glow on glass cards)
// ============================================================
function initGlassDynamic() {
  const glassSet = new WeakSet();
  const applyGlass = (container = document) => {
    container.querySelectorAll('.glass, .glass-red').forEach(el => {
      if (glassSet.has(el)) return;
      glassSet.add(el);
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        el.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.09) 0%, transparent 60%), var(--glass-bg)`;
      }, { passive: true });
      el.addEventListener('mouseleave', () => {
        el.style.background = '';
      }, { passive: true });
    });
  };

  applyGlass();
  const mo = new MutationObserver(() => applyGlass());
  mo.observe(document.body, { childList: true, subtree: true });
}

// ============================================================
// SCROLL REVEAL — robust, handles dynamic content
// ============================================================
function initScrollReveal() {
  let observer;

  const revealSet = new WeakSet();
  function observeAll() {
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    els.forEach(el => {
      if (!revealSet.has(el)) {
        revealSet.add(el);
        observer.observe(el);
      }
    });
  }

  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });

  observeAll();

  // Re-observe on DOM change
  const mo = new MutationObserver(observeAll);
  mo.observe(document.body, { childList: true, subtree: true });

  // Expose for manual call
  window.reObserveReveals = observeAll;
}

// ============================================================
// PARTICLES BACKGROUND
// ============================================================
function initParticles(canvasId = 'particles-canvas') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId;
  let stopped = false;

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      size:  Math.random() * 1.5 + 0.3,
      alpha: Math.random() * 0.35 + 0.05,
      color: Math.random() > 0.7 ? '#FF2E2E' : Math.random() > 0.5 ? '#FF6A00' : '#ffffff'
    };
  }

  function init() {
    resize();
    particles = [];
    const count = Math.min(70, Math.floor((canvas.width * canvas.height) / 14000));
    for (let i = 0; i < count; i++) particles.push(createParticle());
  }

  function draw() {
    if (stopped) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();

      // Connections
      particles.slice(i + 1).forEach(p2 => {
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 90) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = 'rgba(255,255,255,0.04)';
          ctx.globalAlpha = (1 - dist / 90) * 0.25;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });
    });

    ctx.globalAlpha = 1;
    animId = requestAnimationFrame(draw);
  }

  init();
  draw();

  const resizeHandler = () => init();
  window.addEventListener('resize', resizeHandler, { passive: true });

  // Pause when not visible for performance
  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      stopped = false;
      if (!animId) draw();
    } else {
      stopped = true;
      cancelAnimationFrame(animId);
      animId = null;
    }
  });
  io.observe(canvas.parentElement || canvas);

  return () => { stopped = true; cancelAnimationFrame(animId); window.removeEventListener('resize', resizeHandler); };
}

// ============================================================
// LOADER
// ============================================================
function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  const fill = loader.querySelector('.loader-bar-fill');
  let progress = 0;
  document.body.style.overflow = 'hidden';

  const iv = setInterval(() => {
    progress += Math.random() * 18 + 5;
    if (progress >= 100) {
      progress = 100;
      clearInterval(iv);
      setTimeout(() => {
        loader.classList.add('hidden');
        document.body.style.overflow = '';
      }, 250);
    }
    if (fill) fill.style.width = progress + '%';
  }, 70);

  // Failsafe
  setTimeout(() => {
    clearInterval(iv);
    loader.classList.add('hidden');
    document.body.style.overflow = '';
  }, 3000);
}

// ============================================================
// COUNTER ANIMATION
// ============================================================
function animateCounter(el, end, duration = 1800) {
  const suffix = el.getAttribute('data-suffix') || '';
  const prefix = el.getAttribute('data-prefix') || '';
  const startTime = performance.now();

  function update(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current  = Math.floor(eased * end);
    el.textContent = prefix + current.toLocaleString('fr-FR') + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function initCounters() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const end = parseInt(entry.target.getAttribute('data-counter'));
        if (!isNaN(end)) animateCounter(entry.target, end);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  document.querySelectorAll('[data-counter]').forEach(el => observer.observe(el));
}

// ============================================================
// PARALLAX
// ============================================================
function initParallax() {
  const els = document.querySelectorAll('[data-parallax]');
  if (!els.length) return;

  window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    els.forEach(el => {
      const speed = parseFloat(el.getAttribute('data-parallax')) || 0.3;
      el.style.transform = `translateY(${sy * speed}px)`;
    });
  }, { passive: true });
}

// ============================================================
// SMOOTH SCROLL for anchor links
// ============================================================
function initSmoothScroll() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const offset = target.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  });
}

// ============================================================
// RIPPLE on buttons
// ============================================================
function initRipple() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position:absolute;border-radius:50%;pointer-events:none;
      width:10px;height:10px;
      left:${x-5}px;top:${y-5}px;
      background:rgba(255,255,255,0.25);
      transform:scale(0);
      animation:ripple-kf 0.55s ease forwards;
    `;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });

  if (!document.getElementById('ripple-style')) {
    const s = document.createElement('style');
    s.id = 'ripple-style';
    s.textContent = '@keyframes ripple-kf{to{transform:scale(28);opacity:0;}}';
    document.head.appendChild(s);
  }
}

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
function showToast(message, type = 'info', duration = 4000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-20px)';
    toast.style.transition = '0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ============================================================
// PAGE VIEW TRACKING
// ============================================================
function getVisitorId() {
  try {
    let id = localStorage.getItem('hozana-vid');
    if (!id) {
      id = 'v_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 8);
      localStorage.setItem('hozana-vid', id);
    }
    return id;
  } catch {
    window.__hozanaVid = window.__hozanaVid || ('v_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 8));
    return window.__hozanaVid;
  }
}

async function trackPageView(meta = {}) {
  try {
    const geo = await getVisitorGeo();
    const basePayload = {
      page: window.location.pathname.split('/').pop() || 'index',
      visitor_id: getVisitorId()
    };
    const payload = {
      ...basePayload,
      referrer: document.referrer || 'direct',
      user_agent: navigator.userAgent.substring(0, 200),
      ip_address: geo.ip || null,
      country: geo.country || null,
      city: geo.city || null,
      region: geo.region || null,
      timezone: geo.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || null,
      isp: geo.isp || null,
      device_type: getDeviceType(),
      browser_language: navigator.language || null,
      event_type: meta.eventType || 'pageview'
    };
    const postView = (body) => fetch('tables/page_views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    let res = await postView(payload);
    if (!res.ok) res = await postView({
      ...basePayload,
      ip_address: payload.ip_address,
      country: payload.country,
      city: payload.city,
      region: payload.region,
      timezone: payload.timezone,
      isp: payload.isp,
      device_type: payload.device_type,
      browser_language: payload.browser_language,
      event_type: payload.event_type
    });
    if (!res.ok) res = await postView({
      ...basePayload,
      user_agent: payload.user_agent,
      event_type: payload.event_type
    });
    if (!res.ok) res = await postView({ ...basePayload, event_type: payload.event_type });
    if (!res.ok) await postView(basePayload);
  } catch {}
}

function getDeviceType() {
  const ua = navigator.userAgent || '';
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua)) return 'tablet';
  if (/Mobi|Android|iPhone|iPod/i.test(ua)) return 'mobile';
  return 'desktop';
}

function startVisitorHeartbeat() {
  if (window.__hozanaVisitorHeartbeat) return;
  setTimeout(() => {
    if (document.visibilityState === 'visible') trackPageView({ eventType:'heartbeat' });
  }, 10000);
  window.__hozanaVisitorHeartbeat = setInterval(() => {
    if (document.visibilityState === 'visible') {
      trackPageView({ eventType:'heartbeat' });
    }
  }, 60000);
}

function playVisitorMessageSound() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const gain = ctx.createGain();
    const osc = ctx.createOscillator();
    gain.gain.value = 0.06;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.24);
  } catch {}
}

function showVisitorMessage(message) {
  const box = document.createElement('div');
  const level = message.level === 'warning' ? '#f59e0b' : message.level === 'success' ? '#22c55e' : '#FF2E2E';
  box.style.cssText = `
    position:fixed;right:18px;bottom:18px;z-index:99999;max-width:min(360px,calc(100vw - 36px));
    background:rgba(15,15,20,.96);border:1px solid rgba(255,255,255,.14);border-left:4px solid ${level};
    color:#fff;border-radius:12px;padding:14px 16px;box-shadow:0 24px 70px rgba(0,0,0,.45);
    font-family:Inter,system-ui,sans-serif;transform:translateY(16px);opacity:0;transition:.22s ease;
  `;
  box.innerHTML = `
    <div style="display:flex;gap:10px;align-items:flex-start;">
      <div style="width:28px;height:28px;border-radius:50%;background:${level};display:flex;align-items:center;justify-content:center;flex:0 0 auto;">
        <i class="fas fa-bell" style="font-size:12px;color:white;"></i>
      </div>
      <div style="min-width:0;">
        <div style="font-weight:800;font-size:14px;margin-bottom:4px;">${escapeHTML(message.title || 'Message Hozana Concept')}</div>
        <div style="font-size:13px;line-height:1.45;color:rgba(255,255,255,.78);">${escapeHTML(message.message || '')}</div>
      </div>
      <button aria-label="Fermer" style="background:transparent;border:0;color:rgba(255,255,255,.55);font-size:18px;cursor:pointer;padding:0;margin-left:4px;">×</button>
    </div>
  `;
  box.querySelector('button').onclick = () => box.remove();
  document.body.appendChild(box);
  requestAnimationFrame(() => { box.style.opacity = '1'; box.style.transform = 'translateY(0)'; });
  playVisitorMessageSound();
  setTimeout(() => { box.style.opacity = '0'; box.style.transform = 'translateY(16px)'; setTimeout(() => box.remove(), 260); }, 12000);
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

async function pollVisitorMessages() {
  try {
    const visitorId = encodeURIComponent(getVisitorId());
    const res = await fetch(`tables/visitor_messages?visitor_id=eq.${visitorId}&read_at=is.null&order=created_at.desc&limit=3`);
    if (!res.ok) return;
    const json = await res.json();
    const messages = Array.isArray(json.data) ? json.data.reverse() : [];
    for (const msg of messages) {
      showVisitorMessage(msg);
      await fetch(`tables/visitor_messages/${msg.id}`, {
        method:'PATCH',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ read_at:new Date().toISOString() })
      });
    }
  } catch {}
}

function startVisitorMessagePolling() {
  if (window.__hozanaVisitorMessagePolling) return;
  setTimeout(pollVisitorMessages, 3000);
  window.__hozanaVisitorMessagePolling = setInterval(pollVisitorMessages, 8000);
}

async function getVisitorGeo() {
  try {
    const cached = sessionStorage.getItem('hozana-geo');
    if (cached) return JSON.parse(cached);
    try {
      const ownCtrl = new AbortController();
      const ownTimer = setTimeout(() => ownCtrl.abort(), 2500);
      const ownRes = await fetch('/api/visitor-geo', { signal: ownCtrl.signal });
      clearTimeout(ownTimer);
      if (ownRes.ok) {
        const ownGeo = await ownRes.json();
        if (ownGeo && ownGeo.ip) {
          sessionStorage.setItem('hozana-geo', JSON.stringify(ownGeo));
          return ownGeo;
        }
      }
    } catch {}
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 1800);
    const res = await fetch('https://ipapi.co/json/', { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) return {};
    const data = await res.json();
    const geo = {
      ip: data.ip || '',
      country: data.country_name || data.country || '',
      city: data.city || '',
      region: data.region || data.region_code || '',
      timezone: data.timezone || '',
      isp: data.org || data.asn || ''
    };
    sessionStorage.setItem('hozana-geo', JSON.stringify(geo));
    return geo;
  } catch {
    return {};
  }
}

// ============================================================
// NAVBAR ACTIVE LINK
// ============================================================
function initActiveLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index';
  document.querySelectorAll('.navbar-nav a, .mobile-nav-list a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index')) {
      link.classList.add('active');
    }
  });
}

// ============================================================
// LAZY IMAGE LOADING — class "loaded" on reveal
// ============================================================
function initLazyImages() {
  const imgs = document.querySelectorAll('img[loading="lazy"]');
  if (!imgs.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.complete) {
          img.classList.add('loaded');
        } else {
          img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
        }
        io.unobserve(img);
      }
    });
  }, { rootMargin: '100px' });
  imgs.forEach(img => io.observe(img));
}

// ============================================================
// GLOBAL INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initScrollReveal();
  initCounters();
  initParallax();
  initSmoothScroll();
  initRipple();
  initLazyImages();
  trackPageView();
  startVisitorHeartbeat();
  startVisitorMessagePolling();

  // Cursor & glass effect — short delay for DOM settle
  setTimeout(() => {
    initCursor();
    initGlassDynamic();
    initActiveLink();
  }, 200);
});

// Global export
window.HC = {
  showToast,
  animateCounter,
  getVisitorId,
  trackPageView,
  startVisitorHeartbeat,
  startVisitorMessagePolling,
  initParticles
};
