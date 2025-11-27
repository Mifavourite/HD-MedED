/* FILE: script.js */

/* helper selectors */
const qs = s => document.querySelector(s);
const qsa = s => Array.from(document.querySelectorAll(s));

/* THEME (text button) — persist */
(function(){
  const btn = qs('#themeToggle');
  const pref = localStorage.getItem('hd-theme');
  if(pref === 'dark') document.documentElement.classList.add('dark');
  if(btn) btn.textContent = document.documentElement.classList.contains('dark') ? 'Theme: Dark' : 'Theme: Light';
  if(btn) btn.addEventListener('click', () => {
    const dark = document.documentElement.classList.toggle('dark');
    btn.textContent = dark ? 'Theme: Dark' : 'Theme: Light';
    localStorage.setItem('hd-theme', dark ? 'dark' : 'light');
  });
})();

/* Mobile menu toggle */
(function(){
  const ham = qs('.hamburger');
  const menu = qs('.nav-menu');
  if(ham){
    ham.addEventListener('click', () => {
      const expanded = ham.getAttribute('aria-expanded') === 'true';
      ham.setAttribute('aria-expanded', String(!expanded));
      ham.classList.toggle('open');
      if(menu) menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
    });
  }
})();

/* Smooth scroll anchors */
(function(){
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

/* Fade-in observer */
(function(){
  const io = new IntersectionObserver(entries => entries.forEach(en => { if(en.isIntersecting) en.target.classList.add('visible'); }), {threshold:0.12});
  qsa('.fade').forEach(n => io.observe(n));
})();

/* Back to top */
(function(){
  const btn = qs('#backToTop');
  if(!btn) return;
  window.addEventListener('scroll', () => btn.style.display = window.scrollY > 300 ? 'block' : 'none');
  btn.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));
})();

/* Carousel (single-track) */
(function(){
  const track = qs('.carousel-track') || qs('.carousel-container .carousel-track');
  const items = qsa('.carousel-item');
  const prev = qs('.carousel-btn.prev') || qs('.prev');
  const next = qs('.carousel-btn.next') || qs('.next');
  if(!track || items.length === 0) return;
  let idx = items.findIndex(it => it.classList.contains('active')); if(idx<0) idx=0;
  const show = i => { track.style.transform = `translateX(-${i*100}%)`; items.forEach(it=>it.classList.remove('active')); items[i].classList.add('active'); };
  prev && prev.addEventListener('click', ()=>{ idx = (idx-1+items.length)%items.length; show(idx); });
  next && next.addEventListener('click', ()=>{ idx = (idx+1)%items.length; show(idx); });
  setInterval(()=>{ idx=(idx+1)%items.length; show(idx); }, 4500);
})();

/* Counters (only elements with .counter) */
(function(){
  const counters = qsa('.counter');
  counters.forEach(el => {
    const target = Number(el.dataset.target) || (el.id === 'yearsActive' ? (new Date().getFullYear() - 2017) : 0);
    let cur = 0;
    const step = Math.max(1, Math.floor(target / 120));
    const run = () => { cur += step; if(cur >= target){ el.textContent = String(target); return; } el.textContent = String(cur); requestAnimationFrame(run); };
    const io = new IntersectionObserver(entries => { if(entries[0].isIntersecting){ run(); io.disconnect(); } }, {threshold:0.2});
    io.observe(el);
  });
})();

/* Set thisYear footer */
(function(){ const el = qs('#thisYear'); if(el) el.textContent = new Date().getFullYear(); })();

/* JOIN form (index/blog membership) - store in localStorage */
(function(){
  const form = qs('#joinForm') || qs('#joinFormIndex') || qs('.join-form');
  if(!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = qs('#joinName') ? qs('#joinName').value.trim() : (qs('input[name="name"]') ? qs('input[name="name"]').value.trim() : '');
    const email = qs('#joinEmail') ? qs('#joinEmail').value.trim() : '';
    if(!name || !email) return alert('Please provide name and email.');
    const list = JSON.parse(localStorage.getItem('hd-join') || '[]');
    list.push({name,email,interest: (qs('#joinInterest') ? qs('#joinInterest').value : ''), ts: Date.now()});
    localStorage.setItem('hd-join', JSON.stringify(list));
    alert('Thanks — your interest has been recorded.');
    form.reset();
  });
})();

/* Dashboard (localStorage-based) */
(function(){
  if(!location.pathname.endsWith('dashboard.html')) return;
  const profileKey = 'hd-profile';
  const meetKey = 'hd-meet-count';
  const notifyKey = 'hd-notifs';

  const nameEl = qs('#dashName'), emailEl = qs('#dashEmail'), interestEl = qs('#dashInterest');
  const form = qs('#profileForm');
  const meetCountEl = qs('#meetCount'), addBtn = qs('#addMeeting'), resetBtn = qs('#resetMeet'), statusEl = qs('#membershipStatus');
  const notifsEl = qs('#notificationsList');

  function loadProfile(){
    const p = JSON.parse(localStorage.getItem(profileKey) || '{}');
    if(p.name) nameEl.value = p.name;
    if(p.email) emailEl.value = p.email;
    if(p.interest) interestEl.value = p.interest;
  }
  function saveProfile(e){
    e.preventDefault();
    const p = {name: nameEl.value.trim(), email: emailEl.value.trim(), interest: interestEl.value};
    localStorage.setItem(profileKey, JSON.stringify(p));
    addNotification('Profile saved');
    alert('Profile saved locally.');
  }
  function addNotification(msg){
    const arr = JSON.parse(localStorage.getItem(notifyKey) || '[]');
    arr.unshift({text:msg,ts:Date.now()});
    localStorage.setItem(notifyKey, JSON.stringify(arr));
    renderNotifications();
  }
  function renderNotifications(){
    const arr = JSON.parse(localStorage.getItem(notifyKey) || '[]');
    if(!notifsEl) return;
    notifsEl.innerHTML = arr.slice(0,10).map(n => `<li>${new Date(n.ts).toLocaleString()}: ${n.text}</li>`).join('');
  }
  function loadMeetCount(){ const c = Number(localStorage.getItem(meetKey) || 0); meetCountEl.textContent = String(c); updateMembershipStatus(c); }
  function updateMembershipStatus(c){ statusEl.textContent = c >=5 ? 'Congratulations — you qualify for formal membership!' : 'You need ' + (5-c) + ' more meeting(s) to qualify.'; }

  form && form.addEventListener('submit', saveProfile);
  addBtn && addBtn.addEventListener('click', ()=>{ const c = Number(localStorage.getItem(meetKey) || 0) + 1; localStorage.setItem(meetKey, String(c)); loadMeetCount(); addNotification('Attendance marked'); });
  resetBtn && resetBtn.addEventListener('click', ()=>{ localStorage.setItem(meetKey,'0'); loadMeetCount(); addNotification('Attendance reset'); });

  qs('#logoutBtn') && qs('#logoutBtn').addEventListener('click', ()=>{ localStorage.removeItem(profileKey); localStorage.removeItem(meetKey); alert('Logged out (demo)'); location.href = 'index.html'; });

  loadProfile(); renderNotifications(); loadMeetCount();
})();

/* Login page form (redirect to dashboard) */
(function(){
  if(!location.pathname.endsWith('login.html')) return;
  const form = qs('#loginPageForm');
  form && form.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = qs('#loginEmail').value.trim();
    localStorage.setItem('hd-user', JSON.stringify({user,ts:Date.now()}));
    alert('Demo login successful — redirected to dashboard.');
    location.href = 'dashboard.html';
  });
})();

/* Login modal demo (inline login modal on pages) */
(function(){
  const modal = qs('#loginModal');
  if(!modal) return;
  const openLink = qs('a[href="login.html"]') || qs('.btn-login');
  const close = qs('.modal-close'), cancel = qs('#modalCancel');
  openLink && openLink.addEventListener('click', (e) => {
    if(openLink.getAttribute('href') === 'login.html'){ e.preventDefault(); modal.setAttribute('aria-hidden','false'); }
  });
  close && close.addEventListener('click', ()=> modal.setAttribute('aria-hidden','true'));
  cancel && cancel.addEventListener('click', ()=> modal.setAttribute('aria-hidden','true'));
  const form = qs('#loginForm');
  form && form.addEventListener('submit', (e) => {
    e.preventDefault();
    const u = qs('#username').value.trim(); if(!u) return alert('Please enter credentials.');
    localStorage.setItem('hd-user', JSON.stringify({user:u,ts:Date.now()}));
    alert('Demo login success'); modal.setAttribute('aria-hidden','true');
  });
})();

/* Founders timeline content render */
(function(){
  if(!location.pathname.endsWith('founders.html')) return;
  const timeline = [
    {year:2017, text:'HD founded in St. Kitts'},
    {year:2017.7, text:'Expanded to Nigeria (Aug 2017)'},
    {year:2018, text:'Expanded to Guyana'},
    {year:2019, text:'Paused activities'},
    {year:2025, text:'HD Hope launches; Nigeria rekindled; HD International expansion'},
  ];
  const container = qs('#founderTimeline');
  if(!container) return;
  container.innerHTML = timeline.map(t => `<div class="timeline-item"><strong>${ Math.floor(t.year) }</strong> — ${t.text}</div>`).join('');
})();

/* Timeline page render (vertical) */
(function(){
  if(!location.pathname.endsWith('timeline.html')) return;
  const events = [
    {date:'2017', title:'HD founded in St. Kitts'},
    {date:'Aug 2017', title:'Expanded to Nigeria'},
    {date:'2018', title:'Expanded to Guyana'},
    {date:'2019', title:'Paused activities'},
    {date:'2025', title:'HD Hope launches; Nigeria rekindled; HD International expansion'}
  ];
  const el = qs('#timeline');
  if(!el) return;
  el.innerHTML = events.map(ev => `<div class="timeline-item"><strong>${ev.date}</strong><div>${ev.title}</div></div>`).join('');
})();

/* Events system (localStorage + Google Calendar link generation) */
(function(){
  if(!location.pathname.endsWith('events.html')) return;
  const eventsKey = 'hd-events';
  const listEl = qs('#eventsList');
  const form = qs('#addEventForm');
  function loadEvents(){
    const arr = JSON.parse(localStorage.getItem(eventsKey) || '[]').sort((a,b)=> new Date(a.date+'T'+a.time) - new Date(b.date+'T'+b.time));
    if(!listEl) return;
    listEl.innerHTML = arr.map((ev, i) => {
      const start = new Date(ev.date + 'T' + ev.time);
      const gCal = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(ev.title)}&dates=${formatGCalDate(start)}/${formatGCalDate(new Date(start.getTime()+60*60*1000))}&details=${encodeURIComponent('Added via Helpers Dynasty events')}`;
      return `<div class="card mt"><h4>${ev.title}</h4><p class="muted">${ev.date} ${ev.time}</p><div class="form-actions"><button class="btn btn-primary" data-idx="${i}" onclick="registerEvent(${i})">Register</button><a class="btn btn-ghost" href="${gCal}" target="_blank">Add to Google Calendar</a></div></div>`;
    }).join('');
  }
  function formatGCalDate(d){
    // YYYYMMDDTHHMMSSZ (UTC)
    const pad = n=> String(n).padStart(2,'0');
    return `${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
  }
  window.registerEvent = function(i){
    const arr = JSON.parse(localStorage.getItem(eventsKey) || '[]');
    const ev = arr[i];
    if(!ev) return alert('Event not found');
    const regs = JSON.parse(localStorage.getItem('hd-event-regs')||'[]');
    regs.push({event:ev.title,ts:Date.now()});
    localStorage.setItem('hd-event-regs', JSON.stringify(regs));
    alert('Registered (demo).');
  };
  if(form){
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const title = qs('#eventTitle').value.trim();
      const date = qs('#eventDate').value;
      const time = qs('#eventTime').value;
      if(!title||!date||!time) return alert('Complete fields');
      const arr = JSON.parse(localStorage.getItem(eventsKey) || '[]');
      arr.push({title,date,time,ts:Date.now()});
      localStorage.setItem(eventsKey, JSON.stringify(arr));
      form.reset(); loadEvents(); alert('Event added (demo).');
    });
  }
  loadEvents();
})();

/* Blog system (simple client-side posts) */
(function(){
  // posts data (could be moved to separate JSON file)
  const posts = [
    {id:1,title:'Bi-Monthly Unifier — Early CKD Scenario',category:'case',date:'2025-11-26',excerpt:'Practical role-by-role walkthrough...',content:'<p>Full post content here. Use this as the single visible post. Older posts archived.</p>'},
    {id:2,title:'Study With Me — Tips for Focus',category:'study',date:'2025-10-01',excerpt:'How to stay consistent...',content:'<p>Study tips...</p>'}
  ];
  if(!location.pathname.endsWith('blog.html')) return;
  const postsContainer = qs('#postsContainer');
  const categorySel = qs('#blogCategory');
  const searchInput = qs('#blogSearch');
  // populate categories
  const cats = ['all', ...new Set(posts.map(p=>p.category))];
  cats.forEach(c => categorySel && categorySel.insertAdjacentHTML('beforeend', `<option value="${c}">${c}</option>`));
  function render(pArr){
    postsContainer.innerHTML = pArr.map(p => `<article class="card"><h3>${p.title}</h3><p class="meta">${p.date} • ${p.category}</p><p>${p.excerpt}</p><div class="form-actions"><a href="#" class="btn btn-primary" data-id="${p.id}" onclick="openPost(${p.id})">Read</a></div></article>`).join('');
  }
  window.openPost = function(id){
    const post = posts.find(x=>x.id===id);
    if(!post) return alert('Post not found');
    // simple modal-like view using window.open or replace content
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>${post.title}</title><link rel="stylesheet" href="styles.css"></head><body><div class="container"><h1>${post.title}</h1><p class="meta">${post.date}</p>${post.content}<p><a href="blog.html">Back</a></p></div></body></html>`);
    w.document.close();
  };
  function filterRender(){
    const cat = categorySel.value;
    const q = searchInput.value.trim().toLowerCase();
    let res = posts;
    if(cat && cat!=='all') res = res.filter(p=>p.category===cat);
    if(q) res = res.filter(p=> p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q));
    render(res);
  }
  categorySel && categorySel.addEventListener('change', filterRender);
  searchInput && searchInput.addEventListener('input', filterRender);
  render(posts);
})();

/* Members directory (demo) */
(function(){
  if(!location.pathname.endsWith('members.html')) return;
  // sample members (replace with real data or localStorage)
  const sample = [
    {name:'Lordsfavour Anukam', country:'St Kitts', role:'Founder', interests:'Mentorship'},
    {name:'Jane Doe', country:'Nigeria', role:'Student', interests:'Study groups'},
    {name:'John Smith', country:'Guyana', role:'Nurse', interests:'Outreach'}
  ];
  localStorage.setItem('hd-members', localStorage.getItem('hd-members') || JSON.stringify(sample));
  const list = JSON.parse(localStorage.getItem('hd-members') || '[]');
  const container = qs('#membersList');
  const search = qs('#memberSearch');
  function renderMembers(arr){
    container.innerHTML = arr.map(m => `<div class="member-card"><h4>${m.name}</h4><p class="muted">${m.role} • ${m.country}</p><p>${m.interests}</p></div>`).join('');
  }
  if(search){
    search.addEventListener('input', ()=> {
      const q = search.value.trim().toLowerCase();
      const fl = list.filter(m => m.name.toLowerCase().includes(q) || m.country.toLowerCase().includes(q) || m.role.toLowerCase().includes(q) || m.interests.toLowerCase().includes(q));
      renderMembers(fl);
    });
  }
  renderMembers(list);
})();

/* Members directory writeback (optional) */
(function(){
  // helper to add member via console or admin UI if needed
  window.hdAddMember = (m) => {
    const arr = JSON.parse(localStorage.getItem('hd-members') || '[]');
    arr.push(m); localStorage.setItem('hd-members', JSON.stringify(arr));
  };
})();

/* Small guard for pages that need no JS */
document.addEventListener('DOMContentLoaded', ()=> {
  // mark visible fades (for non-IntersectionObserver fallback)
  qsa('.fade').forEach(el => el.classList.add('visible'));
});
