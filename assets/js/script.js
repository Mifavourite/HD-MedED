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
  const attendanceKey = 'hd-attendance';
  const studyStreakKey = 'hd-study-streak';

  const nameEl = qs('#dashName');
  const emailEl = qs('#dashEmail');
  const interestEl = qs('#dashInterest');
  const welcomeEl = qs('#welcomeUser');

  const logoutBtn = qs('#logoutBtn');
  const notifsEl = qs('#notificationsList');
  const markAttendanceBtn = qs('#markAttendanceBtn');
  const viewHistoryBtn = qs('#viewAttendanceHistoryBtn');

  /* ---------- Profile (Sync with Login Data) ---------- */
  function loadProfile() {
    // First try to load from current user (login data)
    const currentUser = JSON.parse(localStorage.getItem('hd-current-user') || '{}');
    const savedProfile = JSON.parse(localStorage.getItem(profileKey) || '{}');
    
    // Merge login data with saved profile
    const profile = {
      name: currentUser.name || savedProfile.name || '',
      email: currentUser.email || savedProfile.email || '',
      interest: savedProfile.interest || ''
    };

    // Update form fields
    if (nameEl) nameEl.value = profile.name;
    if (emailEl) emailEl.value = profile.email;
    if (interestEl && profile.interest) interestEl.value = profile.interest;

    // Update welcome message
    if (welcomeEl && profile.name) {
      welcomeEl.textContent = `Welcome back, ${profile.name.split(' ')[0]}!`;
    }

    // Save merged profile
    if (profile.name || profile.email) {
      localStorage.setItem(profileKey, JSON.stringify(profile));
    }
  }

  function saveProfile(e) {
    e.preventDefault();
    // Sanitize inputs if Security module is available
    const sanitize = typeof window.Security !== 'undefined' ? window.Security.sanitizeInput : (x) => x;
    const escape = typeof window.Security !== 'undefined' ? window.Security.escapeHTML : (x) => x;
    
    const profile = {
      name: escape(sanitize(nameEl?.value.trim() || '')),
      email: sanitize(emailEl?.value.trim() || '').toLowerCase(),
      interest: escape(interestEl?.value || '')
    };
    localStorage.setItem(profileKey, JSON.stringify(profile));
    addNotification('Profile saved');
    
    // Update welcome message
    if (welcomeEl && profile.name) {
      welcomeEl.textContent = `Welcome back, ${profile.name.split(' ')[0]}!`;
    }
    
    alert('Profile saved successfully.');
  }

  /* ---------- Attendance Tracking ---------- */
  function loadAttendance() {
    const attendance = JSON.parse(localStorage.getItem(attendanceKey) || '[]');
    const today = new Date().toDateString();
    const todayAttendance = attendance.find(a => new Date(a.date).toDateString() === today);
    
    const todayEl = qs('#todayAttendance');
    if (todayEl) {
      const sanitize = typeof window.Security !== 'undefined' ? window.Security.escapeHTML : (x) => x;
      if (todayAttendance) {
        const eventName = sanitize(todayAttendance.event || 'Event');
        todayEl.innerHTML = `<div style="color: #16a34a; font-weight: 600;">✓ You've marked attendance for today (${eventName})</div>`;
      } else {
        todayEl.innerHTML = '<div style="color: var(--muted);">No attendance marked for today.</div>';
      }
    }
    
    updateAttendanceStats();
  }

  function markAttendance() {
    const today = new Date().toDateString();
    const attendance = JSON.parse(localStorage.getItem(attendanceKey) || '[]');
    
    // Check if already marked today
    const todayAttendance = attendance.find(a => new Date(a.date).toDateString() === today);
    if (todayAttendance) {
      alert('You\'ve already marked attendance for today!');
      return;
    }
    
    // Sanitize input
    const sanitize = typeof window.Security !== 'undefined' ? window.Security.sanitizeInput : (x) => x;
    const eventNameInput = prompt('Enter event name (or leave blank for general attendance):') || 'General Attendance';
    const eventName = sanitize(eventNameInput);
    
    attendance.push({
      date: new Date().toISOString(),
      event: eventName,
      timestamp: Date.now()
    });
    
    localStorage.setItem(attendanceKey, JSON.stringify(attendance));
    addNotification(`Attendance marked for: ${eventName}`);
    loadAttendance();
    updateStats();
  }

  function viewAttendanceHistory() {
    const historyDiv = qs('#attendanceHistory');
    const historyList = qs('#attendanceHistoryList');
    
    if (!historyDiv || !historyList) return;
    
    const isVisible = historyDiv.style.display !== 'none';
    historyDiv.style.display = isVisible ? 'none' : 'block';
    
    if (!isVisible) {
      const attendance = JSON.parse(localStorage.getItem(attendanceKey) || '[]');
      if (attendance.length === 0) {
        historyList.innerHTML = '<li>No attendance records yet.</li>';
      } else {
        historyList.innerHTML = attendance
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 20)
          .map(a => {
            const date = new Date(a.date);
            return `<li>${date.toLocaleDateString()} - ${a.event}</li>`;
          })
          .join('');
      }
    }
  }

  function updateAttendanceStats() {
    const attendance = JSON.parse(localStorage.getItem(attendanceKey) || '[]');
    const countEl = qs('#attendanceCount');
    if (countEl) countEl.textContent = attendance.length;
  }

  /* ---------- Courses ---------- */
  function loadCourses() {
    const coursesGrid = qs('#coursesGrid');
    if (!coursesGrid) return;

    const courses = [
      {
        title: 'Medical Terminology Basics',
        description: 'Learn essential medical terms and their meanings',
        link: 'https://www.coursera.org/learn/medical-terminology',
        provider: 'Coursera',
        category: 'Basics'
      },
      {
        title: 'Anatomy and Physiology',
        description: 'Comprehensive guide to human body systems',
        link: 'https://www.khanacademy.org/science/biology/human-biology',
        provider: 'Khan Academy',
        category: 'Anatomy'
      },
      {
        title: 'Introduction to Public Health',
        description: 'Foundations of public health practice',
        link: 'https://www.edx.org/course/introduction-to-public-health',
        provider: 'edX',
        category: 'Public Health'
      },
      {
        title: 'Clinical Research Fundamentals',
        description: 'Learn the basics of clinical research and study design',
        link: 'https://www.coursera.org/learn/clinical-research',
        provider: 'Coursera',
        category: 'Research'
      },
      {
        title: 'Healthcare Ethics',
        description: 'Ethical considerations in healthcare practice',
        link: 'https://www.khanacademy.org/test-prep/mcat/behavior/biological-basis-of-behavior/v/ethics',
        provider: 'Khan Academy',
        category: 'Ethics'
      },
      {
        title: 'Biostatistics',
        description: 'Statistical methods for healthcare professionals',
        link: 'https://www.coursera.org/learn/biostatistics',
        provider: 'Coursera',
        category: 'Statistics'
      }
    ];

    coursesGrid.innerHTML = courses.map(course => `
      <div class="course-item">
        <h4>${course.title}</h4>
        <p class="muted">${course.description}</p>
        <div class="course-meta">
          <span class="course-category">${course.category}</span>
          <span class="course-provider">${course.provider}</span>
        </div>
        <a href="${course.link}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="margin-top: 12px; display: inline-block;">
          Access Course →
        </a>
      </div>
    `).join('');

    // Update completed courses count (simplified - could track actual completions)
    const completedEl = qs('#coursesCompleted');
    if (completedEl) {
      const completed = JSON.parse(localStorage.getItem('hd-courses-completed') || '[]');
      completedEl.textContent = completed.length;
    }
  }

  /* ---------- Study Streak ---------- */
  function updateStudyStreak() {
    const streakData = JSON.parse(localStorage.getItem(studyStreakKey) || '{"lastDate": null, "currentStreak": 0}');
    const today = new Date().toDateString();
    
    if (streakData.lastDate !== today) {
      const lastDate = streakData.lastDate ? new Date(streakData.lastDate) : null;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (!lastDate || lastDate.toDateString() === yesterday.toDateString()) {
        // Continue streak
        streakData.currentStreak += 1;
      } else {
        // Reset streak
        streakData.currentStreak = 1;
      }
      
      streakData.lastDate = today;
      localStorage.setItem(studyStreakKey, JSON.stringify(streakData));
    }
    
    const streakEl = qs('#studyStreak');
    if (streakEl) streakEl.textContent = streakData.currentStreak;
  }

  /* ---------- Stats Update ---------- */
  function updateStats() {
    updateAttendanceStats();
    updateStudyStreak();
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
    if (list.length === 0) {
      notifsEl.innerHTML = '<li>No notifications yet.</li>';
      return;
    }
    notifsEl.innerHTML = list
      .map(n => `<li>${new Date(n.ts).toLocaleString()}: ${n.text}</li>`)
      .join('');
  }

  /* ---------- Events ---------- */
  form.onsubmit = saveProfile;

  logoutBtn && logoutBtn.addEventListener('click', () => {
    // Use secure session destruction if available
    if (typeof window.Security !== 'undefined') {
      window.Security.destroySession();
    } else {
      localStorage.removeItem(profileKey);
      localStorage.removeItem(notifyKey);
      localStorage.removeItem('hd-logged-in');
      localStorage.removeItem('hd-current-user');
      localStorage.removeItem('hd-session');
      localStorage.removeItem('hd-session-id');
    }
    alert('Logged out successfully');
    location.href = 'index.html';
  });

  markAttendanceBtn && markAttendanceBtn.addEventListener('click', markAttendance);
  viewHistoryBtn && viewHistoryBtn.addEventListener('click', viewAttendanceHistory);

  /* ---------- Session Security Check ---------- */
  function checkDashboardAuth() {
    if (typeof window.Security !== 'undefined') {
      if (!window.Security.isSessionValid()) {
        window.Security.destroySession();
        alert('Your session has expired. Please login again.');
        window.location.href = 'login.html';
        return false;
      }
      // Initialize inactivity timer
      window.Security.initializeInactivityTimer();
    }
    return true;
  }

  /* ---------- Init ---------- */
  // Check authentication before initializing
  if (checkDashboardAuth()) {
    loadProfile();
    loadAttendance();
    loadCourses();
    updateStats();
    renderNotifications();
  }
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
      id: 'hd-hope-hangout-2026-01',
      title: 'HD Hope Monthly Hangout',
      date: '2026-01-24',
      time: '19:00',
      isDefault: true
    },
    {
      id: 'hd-intl-ng-hangout-2026-01',
      title: 'HD International Monthly Hangout',
      date: '2026-01-17',
      time: '19:00',
      isDefault: true
    },
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
   Fade Animations - Movie-like
========================= */
(function fadeModule() {
  const fadeElements = qsa('.fade, .section');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 100); // Staggered animation
      }
    });
  }, { 
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  fadeElements.forEach(el => observer.observe(el));
})();

/* =========================
   Parallax Scroll Effects
========================= */
(function parallaxModule() {
  const parallaxElements = qs('.hero');
  if (!parallaxElements) return;
  
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const rate = scrolled * 0.5;
    if (parallaxElements) {
      parallaxElements.style.transform = `translateY(${rate}px)`;
    }
  }, { passive: true });
})();

/* =========================
   Smooth Page Transitions
========================= */
(function smoothTransitionsModule() {
  document.body.style.opacity = '0';
  window.addEventListener('load', () => {
    document.body.style.transition = 'opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    document.body.style.opacity = '1';
  });
  
  // Smooth transitions for links
  qsa('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href !== '#' && href.startsWith('#')) {
        e.preventDefault();
        const target = qs(href);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });
})();

/* =========================
   Medical Icons Animation
========================= */
(function medicalIconsModule() {
  const container = document.querySelector(".medical-icons-layer");
  if (!container) return;
  
  const icons = ["🩺", "⚕️", "💊", "🏥", "🧬", "🫀"];

  function createMedicalIcon() {
    const icon = document.createElement("div");
    icon.classList.add("medical-icon");
    icon.textContent = icons[Math.floor(Math.random() * icons.length)];

    // Random horizontal position (right side only)
    icon.style.right = Math.random() * 80 + "px";

    // Random size
    icon.style.fontSize = Math.random() * 14 + 18 + "px";

    // Random animation duration
    icon.style.animationDuration = Math.random() * 8 + 8 + "s";

    container.appendChild(icon);

    // Remove after animation
    setTimeout(() => {
      icon.remove();
    }, 16000);
  }

  // Create icons repeatedly
  setInterval(createMedicalIcon, 900);
})();
