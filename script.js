/* script.js — interactive features for Helpers Dynasty site */

/* Utilities */
const qs = sel => document.querySelector(sel);
const qsa = sel => Array.from(document.querySelectorAll(sel));

/* Theme: persisted */
(function initTheme(){
  const toggle = qs('#themeToggle');
  const stored = localStorage.getItem('hd-theme');
  if(stored === 'dark') document.documentElement.classList.add('dark');
  toggle && toggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('hd-theme', isDark ? 'dark' : 'light');
    toggle.textContent = isDark ? '☀️' : '🌙';
  });
  // set initial icon
  if(toggle) toggle.textContent = document.documentElement.classList.contains('dark') ? '☀️' : '🌙';
})();

/* Mobile menu */
(function initMobileMenu(){
  const ham = qs('.hamburger');
  const menu = qs('.nav-menu');
  ham && ham.addEventListener('click', () => {
    const expanded = ham.getAttribute('aria-expanded') === 'true';
    ham.setAttribute('aria-expanded', String(!expanded));
    ham.classList.toggle('open');
    if(menu) menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
  });
})();

/* Smooth scroll for anchors */
(function initSmoothScroll(){
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if(href === "#" || href === "") return;
      e.preventDefault();
      const el = document.querySelector(href);
      if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
    });
  });
})();

/* Fade-in intersection observer */
(function initFadeIn(){
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if(en.isIntersecting) en.target.classList.add('visible');
    });
  }, {threshold: 0.12});
  qsa('.fade').forEach(el => io.observe(el));
})();

/* Back to top */
(function initBackToTop(){
  const btn = qs('#backToTop');
  if(!btn) return;
  window.addEventListener('scroll', () => {
    btn.style.display = window.scrollY > 300 ? 'block' : 'none';
  });
  btn.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));
})();

/* Carousel (auto + manual) */
(function initCarousel(){
  const track = qs('.carousel-track');
  const items = qsa('.carousel-item');
  const prev = qs('.carousel-btn.prev');
  const next = qs('.carousel-btn.next');
  if(!track || items.length === 0) return;
  let idx = items.findIndex(it => it.classList.contains('active'));
  if(idx < 0) idx = 0;
  const show = (i) => {
    track.style.transform = `translateX(-${i * 100}%)`;
    items.forEach(it => it.classList.remove('active'));
    items[i].classList.add('active');
  };
  prev && prev.addEventListener('click', () => { idx = (idx - 1 + items.length) % items.length; show(idx); });
  next && next.addEventListener('click', () => { idx = (idx + 1) % items.length; show(idx); });

  // Auto-play
  setInterval(() => { idx = (idx + 1) % items.length; show(idx); }, 4000);
})();

/* Counters */
(function initCounters(){
  const counters = qsa('.counter');
  counters.forEach(el => {
    const target = Number(el.dataset.target) || 0;
    let cur = 0;
    const step = Math.max(1, Math.floor(target / 120));
    const run = () => {
      cur += step;
      if(cur >= target) { el.textContent = String(target); return; }
      el.textContent = String(cur);
      requestAnimationFrame(run);
    };
    // start when visible
    const io = new IntersectionObserver(entries => {
      if(entries[0].isIntersecting) { run(); io.disconnect(); }
    }, {threshold:0.2});
    io.observe(el);
  });
})();

/* Join form validation + demo submission */
(function initJoinForm(){
  const form = qs('#joinForm');
  if(!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = qs('#joinName').value.trim();
    const email = qs('#joinEmail').value.trim();
    if(!name || !email) {
      alert('Please provide your name and valid email.');
      return;
    }
    // demo: store in localStorage (simulate)
    const list = JSON.parse(localStorage.getItem('hd-join') || '[]');
    list.push({name,email,interest:qs('#joinInterest').value,ts:Date.now()});
    localStorage.setItem('hd-join', JSON.stringify(list));
    alert('Thanks! Your interest has been recorded. A team member will contact you.');
    form.reset();
  });
})();

/* Login modal (demo) */
(function initLoginModal(){
  const modal = qs('#loginModal');
  const openBtn = qs('a[href="login.html"]') || qs('a.btn-login');
  const close = qs('.modal-close');
  const cancel = qs('#modalCancel');

  // If user clicked "Member Login" link in header, open modal (to keep user on site)
  openBtn && openBtn.addEventListener('click', (e) => {
    // If link is to login.html, prevent and open modal demo
    if(openBtn.getAttribute('href') === 'login.html') {
      e.preventDefault();
      modal && modal.setAttribute('aria-hidden', 'false');
    }
  });

  close && close.addEventListener('click', () => modal.setAttribute('aria-hidden', 'true'));
  cancel && cancel.addEventListener('click', () => modal.setAttribute('aria-hidden', 'true'));

  const form = qs('#loginForm');
  if(form) form.addEventListener('submit', (e) => {
    e.preventDefault();
    const u = qs('#username').value.trim();
    const p = qs('#password').value.trim();
    if(!u || !p) return alert('Please enter both username and password.');
    // demo-login: accept any credentials and simulate member dashboard
    localStorage.setItem('hd-user', JSON.stringify({user:u,ts:Date.now()}));
    alert('Demo login successful. (This is a static demo; integrate real auth for production.)');
    modal.setAttribute('aria-hidden','true');
  });
})();

/* Small helpers */
(function initMetaYear(){
  const y = new Date().getFullYear();
  const el = qs('#thisYear');
  if(el) el.textContent = y;
})();
