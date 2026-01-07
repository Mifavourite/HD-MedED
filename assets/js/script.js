/* =========================
   Helper selectors
========================= */
const qs = s => document.querySelector(s);
const qsa = s => Array.from(document.querySelectorAll(s));

/* =========================
   Dashboard logic
========================= */
(function dashboardModule() {
  // DOM-based detection (robust)
  const form = qs('#profileForm');
  if (!form) return;

  const profileKey = 'hd-profile';
  const notifyKey = 'hd-notifs';

  const nameEl = qs('#dashName');
  const emailEl = qs('#dashEmail');
  const interestEl = qs('#dashInterest');

  const logoutBtn = qs('#logoutBtn');

  const notifsEl = qs('#notificationsList');

  /* ---------- Profile ---------- */
  function loadProfile() {
    const p = JSON.parse(localStorage.getItem(profileKey) || '{}');
    if (nameEl && p.name) nameEl.value = p.name;
    if (emailEl && p.email) emailEl.value = p.email;
    if (interestEl && p.interest) interestEl.value = p.interest;
  }

  function saveProfile(e) {
    e.preventDefault();
    const profile = {
      name: nameEl?.value.trim(),
      email: emailEl?.value.trim(),
      interest: interestEl?.value
    };
    localStorage.setItem(profileKey, JSON.stringify(profile));
    addNotification('Profile saved');
    alert('Profile saved locally.');
  }

  /* ---------- Notifications ---------- */
  function addNotification(text) {
    const list = JSON.parse(localStorage.getItem(notifyKey) || '[]');
    list.unshift({ text, ts: Date.now() });
    localStorage.setItem(notifyKey, JSON.stringify(list.slice(0, 50)));
    renderNotifications();
  }

  function renderNotifications() {
    if (!notifsEl) return;
    const list = JSON.parse(localStorage.getItem(notifyKey) || '[]');
    notifsEl.innerHTML = list
      .map(n => `<li>${new Date(n.ts).toLocaleString()}: ${n.text}</li>`)
      .join('');
  }

  /* ---------- Events ---------- */
  form.onsubmit = saveProfile;

  logoutBtn && logoutBtn.addEventListener('click', () => {
    localStorage.removeItem(profileKey);
    localStorage.removeItem(notifyKey);
    localStorage.removeItem('hd-logged-in');
    localStorage.removeItem('hd-current-user');
    alert('Logged out successfully');
    location.href = 'index.html';
  });

  /* ---------- Init ---------- */
  loadProfile();
  renderNotifications();
})();

/* =========================
   Theme Toggle
========================= */
(function themeModule() {
  const themeBtn = qs('#themeToggle');
  if (!themeBtn) return;
  
  const themeKey = 'hd-theme';
  const savedTheme = localStorage.getItem(themeKey) || 'light';
  
  if (savedTheme === 'dark') document.body.classList.add('dark');
  
  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem(themeKey, isDark ? 'dark' : 'light');
  });
})();

/* =========================
   Hamburger Menu
========================= */
(function hamburgerModule() {
  const hamburger = qs('.hamburger');
  const navMenu = qs('.nav-menu');
  if (!hamburger || !navMenu) return;
  
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    const expanded = hamburger.classList.contains('active');
    hamburger.setAttribute('aria-expanded', expanded);
  });
  
  // Close on link click
  qsa('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* =========================
   Timeline
========================= */
(function timelineModule() {
  const timelineEl = qs('#timeline');
  const founderTimelineEl = qs('#founderTimeline');
  
  const timelineData = [
    { year: '2026', event: 'Helpers Dynasty continues its mission with renewed commitment to health education excellence' },
    { year: '2018', event: 'Helpers Dynasty Guyana Chapter and health education programs launched' },
    { year: '2019', event: 'Community expansion and Helpers Dynasty ABSU Chapter launched' },
    { year: '2020', event: 'Operational Pause'},
    { year: 'November 2025', event: 'Helpers Dynasty revitalized with renewed commitment to health education excellence. Reorganized into two interconnected subgroups: Helpers Dynasty International and Helpers Dynasty Hope' },
    { year: '2025', event: 'Launch of Study With Me live sessions, mentorship programs, and monthly health conferences' }
  ];
  
  function renderTimeline(container, data) {
    if (!container) return;
    container.innerHTML = data.map(item => `
      <div class="timeline-item">
        <strong>${item.year}</strong> — ${item.event}
      </div>
    `).join('');
  }
  
  renderTimeline(timelineEl, timelineData);
  renderTimeline(founderTimelineEl, timelineData.slice(0, 3));
})();

/* =========================
   Events
========================= */
(function eventsModule() {
  const eventsList = qs('#eventsList');
  const addEventForm = qs('#addEventForm');
  if (!eventsList) return;
  
  const eventsKey = 'hd-events';
  
  // Default events
  const defaultEvents = [
    {
      id: 'hd-intl-na-hangout-2026-01',
      title: 'HD International NA Monthly Hangout',
      date: '2026-01-10',
      time: '19:00',
      isDefault: true
    },
    {
      id: 'hd-intl-ng-hangout-2026-01',
      title: 'HD International NG Monthly Hangout',
      date: '2026-01-17',
      time: '19:00',
      isDefault: true
    },
    {
      id: 'hd-hope-hangout-2026-01',
      title: 'HD Hope Monthly Hangout',
      date: '2026-01-24',
      time: '19:00',
      isDefault: true
    }
  ];
  
  function loadEvents() {
    let events = JSON.parse(localStorage.getItem(eventsKey) || '[]');
    
    // Initialize with default events if not already set
    const hasDefaults = events.some(e => e.isDefault);
    if (!hasDefaults) {
      events = [...defaultEvents, ...events];
      localStorage.setItem(eventsKey, JSON.stringify(events));
    } else {
      // Ensure default events are always present and up to date
      defaultEvents.forEach(defaultEvent => {
        const exists = events.find(e => e.id === defaultEvent.id);
        if (!exists) {
          events.push(defaultEvent);
        } else {
          // Update existing default event
          const index = events.findIndex(e => e.id === defaultEvent.id);
          events[index] = { ...events[index], ...defaultEvent };
        }
      });
      localStorage.setItem(eventsKey, JSON.stringify(events));
    }
    
    // Sort events by date
    events.sort((a, b) => {
      const dateA = new Date(a.date + 'T' + (a.time || '00:00'));
      const dateB = new Date(b.date + 'T' + (b.time || '00:00'));
      return dateA - dateB;
    });
    
    if (events.length === 0) {
      eventsList.innerHTML = '<p class="muted">No events scheduled yet.</p>';
      return;
    }
    
    eventsList.innerHTML = events.map(e => `
      <div class="card event-card">
        <h3>${e.title}</h3>
        <p class="muted">${new Date(e.date + 'T' + (e.time || '00:00')).toLocaleString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
      </div>
    `).join('');
  }
  
  if (addEventForm) {
    addEventForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = qs('#eventTitle').value;
      const date = qs('#eventDate').value;
      const time = qs('#eventTime').value;
      
      const events = JSON.parse(localStorage.getItem(eventsKey) || '[]');
      events.push({ title, date, time, id: Date.now(), isDefault: false });
      localStorage.setItem(eventsKey, JSON.stringify(events));
      
      loadEvents();
      addEventForm.reset();
    });
  }
  
  loadEvents();
})();

/* =========================
   Back to Top
========================= */
(function backToTopModule() {
  const backToTopBtn = qs('#backToTop');
  if (!backToTopBtn) return;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopBtn.style.display = 'block';
    } else {
      backToTopBtn.style.display = 'none';
    }
  });
  
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* =========================
   Footer Year
========================= */
(function footerYearModule() {
  const yearEl = qs('#thisYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();

/* =========================
   Login Form (handled by auth.js)
========================= */
// Login functionality moved to auth.js

/* =========================
   Fade Animations
========================= */
(function fadeModule() {
  const fadeElements = qsa('.fade');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });
  
  fadeElements.forEach(el => observer.observe(el));
})();
