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
  const meetKey = 'hd-meet-count';
  const notifyKey = 'hd-notifs';

  const nameEl = qs('#dashName');
  const emailEl = qs('#dashEmail');
  const interestEl = qs('#dashInterest');

  const meetCountEl = qs('#meetCount');
  const statusEl = qs('#membershipStatus');

  const addBtn = qs('#addMeeting');
  const resetBtn = qs('#resetMeet');
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

  /* ---------- Attendance ---------- */
  function updateMembershipStatus(count) {
    if (!statusEl) return;
    statusEl.textContent =
      count >= 5
        ? 'Congratulations — you qualify for formal membership!'
        : `You need ${5 - count} more meeting(s) to qualify.`;
  }

  function loadMeetCount() {
    const count = Number(localStorage.getItem(meetKey) || 0);
    if (meetCountEl) meetCountEl.textContent = String(count);
    updateMembershipStatus(count);
  }

  /* ---------- Events ---------- */
  form.onsubmit = saveProfile;

  addBtn && addBtn.addEventListener('click', () => {
    const count = Number(localStorage.getItem(meetKey) || 0) + 1;
    localStorage.setItem(meetKey, count);
    loadMeetCount();
    addNotification('Attendance marked');
  });

  resetBtn && resetBtn.addEventListener('click', () => {
    localStorage.setItem(meetKey, 0);
    loadMeetCount();
    addNotification('Attendance reset');
  });

  logoutBtn && logoutBtn.addEventListener('click', () => {
    localStorage.removeItem(profileKey);
    localStorage.removeItem(meetKey);
    localStorage.removeItem(notifyKey);
    alert('Logged out (demo)');
    location.href = 'index.html';
  });

  /* ---------- Init ---------- */
  loadProfile();
  loadMeetCount();
  renderNotifications();
})();
