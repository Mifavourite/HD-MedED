// Helpers Dynasty interactive script (no crescent moon icon; "Theme" text button used)

/* helpers */
const qs = s => document.querySelector(s);
const qsa = s => Array.from(document.querySelectorAll(s));

/* Theme switcher (text button 'Theme') — persists to localStorage */
(function initTheme(){
  const toggle = qs('#themeToggle');
  const saved = localStorage.getItem('hd-theme');
  if(saved === 'dark') document.documentElement.classList.add('dark');
  // set initial label (no icon)
  if(toggle) toggle.textContent = document.documentElement.classList.contains('dark') ? 'Theme: Dark' : 'Theme: Light';
  toggle && toggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('hd-theme', isDark ? 'dark' : 'light');
    toggle.textContent = isDark ? 'Theme: Dark' : 'Theme: Light';
  });
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

/* Smooth internal links */
(function initSmoothScroll(){
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if(!href || href === '#') return;
      e.preventDefault();
      const el = document.querySelector(href);
      if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
    });
  });
})();

/* Fade-in sections via IntersectionObserver */
(function initFadeIn(){
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if(en.isIntersecting) en.target.classList.add('visible');
    });
  }, {threshold: 0.12});
  qsa('.fade').forEach(node => obs.observe(node));
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
  setInterval(() => { idx = (idx + 1) % items.length; show(idx); }, 4500);
})();

/* Counters — animate when visible */
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
    const io = new IntersectionObserver(entries => {
      if(entries[0].isIntersecting) { run(); io.disconnect(); }
    }, {threshold:0.2});
    io.observe(el);
  });
})();

/* Join form handling (demo: stores in localStorage) */
(function initJoinForm(){
  const form = qs('#joinForm');
  if(!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = qs('#joinName').value.trim();
    const email = qs('#joinEmail').value.trim();
    if(!name || !email) return alert('Please enter your name and a valid email.');
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
  const openLink = qs('a[href="login.html"]');
  const close = qs('.modal-close');
  const cancel = qs('#modalCancel');

  openLink && openLink.addEventListener('click', (e) => {
    if(openLink.getAttribute('href') === 'login.html') {
      e.preventDefault();
      modal && modal.setAttribute('aria-hidden','false');
    }
  });

  close && close.addEventListener('click', () => modal.setAttribute('aria-hidden','true'));
  cancel && cancel.addEventListener('click', () => modal.setAttribute('aria-hidden','true'));

  const form = qs('#loginForm');
  if(form) form.addEventListener('submit', (e) => {
    e.preventDefault();
    const u = qs('#username').value.trim();
    const p = qs('#password').value.trim();
    if(!u || !p) return alert('Please enter both username and password.');
    localStorage.setItem('hd-user', JSON.stringify({user:u,ts:Date.now()}));
    alert('Demo login successful. (Static demo only.)');
    modal.setAttribute('aria-hidden','true');
  });
})();

/* Set footer year */
(function setYear(){ const el = qs('#thisYear'); if(el) el.textContent = new Date().getFullYear(); })();
