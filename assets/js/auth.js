/* =========================
   Authentication System
========================= */
const qs = s => document.querySelector(s);
const qsa = s => Array.from(document.querySelectorAll(s));

(function authModule() {
  const accountsKey = 'hd-accounts';
  const currentUserKey = 'hd-current-user';
  
  // Tab switching
  const tabs = qsa('.auth-tab');
  const tabContents = qsa('.auth-tab-content');
  const messageEl = qs('#authMessage');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      
      // Update active states
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(tc => tc.classList.remove('active'));
      
      tab.classList.add('active');
      qs(`#${targetTab}Tab`).classList.add('active');
      
      // Clear messages
      if (messageEl) messageEl.textContent = '';
    });
  });

  // Get accounts from localStorage
  function getAccounts() {
    try {
      return JSON.parse(localStorage.getItem(accountsKey) || '{}');
    } catch {
      return {};
    }
  }

  // Save accounts to localStorage
  function saveAccounts(accounts) {
    localStorage.setItem(accountsKey, JSON.stringify(accounts));
  }

  // Password hash function
  function hashPassword(password) {
    // Hash function for password storage
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  // Create Account
  const signupForm = qs('#signupPageForm');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = qs('#signupName').value.trim();
      const email = qs('#signupEmail').value.trim().toLowerCase();
      const username = qs('#signupUsername').value.trim().toLowerCase();
      const password = qs('#signupPass').value;
      const passwordConfirm = qs('#signupPassConfirm').value;
      
      // Validation
      if (!name || !email || !username || !password) {
        showMessage('Please fill in all fields.', 'error');
        return;
      }
      
      if (password.length < 6) {
        showMessage('Password must be at least 6 characters long.', 'error');
        return;
      }
      
      if (password !== passwordConfirm) {
        showMessage('Passwords do not match.', 'error');
        return;
      }
      
      const accounts = getAccounts();
      
      // Check if email or username already exists
      if (accounts[email] || accounts[username]) {
        showMessage('Email or username already exists. Please use different credentials.', 'error');
        return;
      }
      
      // Create account
      const hashedPassword = hashPassword(password);
      accounts[email] = {
        name,
        email,
        username,
        passwordHash: hashedPassword,
        createdAt: Date.now()
      };
      
      // Also store by username for login flexibility
      accounts[username] = accounts[email];
      
      saveAccounts(accounts);
      showMessage('Account created successfully! You can now login.', 'success');
      
      // Switch to login tab after 1.5 seconds
      setTimeout(() => {
        tabs[0].click();
        signupForm.reset();
      }, 1500);
    });
  }

  // Login
  const loginForm = qs('#loginPageForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const identifier = qs('#loginEmail').value.trim().toLowerCase();
      const password = qs('#loginPass').value;
      
      if (!identifier || !password) {
        showMessage('Please enter both email/username and password.', 'error');
        return;
      }
      
      const accounts = getAccounts();
      const account = accounts[identifier];
      
      if (!account) {
        showMessage('Invalid email/username or password.', 'error');
        return;
      }
      
      const hashedPassword = hashPassword(password);
      
      if (account.passwordHash !== hashedPassword) {
        showMessage('Invalid email/username or password.', 'error');
        return;
      }
      
      // Login successful
      localStorage.setItem(currentUserKey, JSON.stringify({
        email: account.email,
        username: account.username,
        name: account.name
      }));
      
      // Store login state
      localStorage.setItem('hd-logged-in', 'true');
      localStorage.setItem('hd-login-email', account.email);
      
      showMessage('Login successful! Redirecting...', 'success');
      
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    });
  }

  function showMessage(text, type = 'info') {
    if (!messageEl) return;
    messageEl.textContent = text;
    messageEl.className = `auth-message ${type}`;
    
    if (type === 'success') {
      setTimeout(() => {
        messageEl.textContent = '';
        messageEl.className = 'auth-message muted';
      }, 3000);
    }
  }

  // Check if user is logged in (for protected pages)
  function checkAuth() {
    const isLoggedIn = localStorage.getItem('hd-logged-in') === 'true';
    if (!isLoggedIn && window.location.pathname.includes('dashboard.html')) {
      window.location.href = 'login.html';
    }
  }

  // Run auth check on dashboard
  if (window.location.pathname.includes('dashboard.html')) {
    checkAuth();
  }
  
  // Protect game page (optional - remove if you want public access)
  // if (window.location.pathname.includes('game.html')) {
  //   const isLoggedIn = localStorage.getItem('hd-logged-in') === 'true';
  //   if (!isLoggedIn) {
  //     // Optional: redirect to login, or allow public access
  //   }
  // }
})();

