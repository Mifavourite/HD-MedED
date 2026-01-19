/* =========================
   Authentication System (Secure)
   ========================= */
const qs = s => document.querySelector(s);
const qsa = s => Array.from(document.querySelectorAll(s));

(function authModule() {
  'use strict';

  // Wait for Security module to load
  if (typeof window.Security === 'undefined') {
    console.error('Security module not loaded');
    return;
  }

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

  // Get accounts from localStorage (with error handling)
  function getAccounts() {
    try {
      const accounts = localStorage.getItem(accountsKey);
      if (!accounts) return {};
      return JSON.parse(accounts);
    } catch (e) {
      console.error('Error reading accounts:', e);
      return {};
    }
  }

  // Save accounts to localStorage
  function saveAccounts(accounts) {
    try {
      localStorage.setItem(accountsKey, JSON.stringify(accounts));
    } catch (e) {
      console.error('Error saving accounts:', e);
      showMessage('Error saving account data. Please try again.', 'error');
    }
  }

  // Create Account (Secure)
  const signupForm = qs('#signupPageForm');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Sanitize inputs
      const name = Security.sanitizeInput(qs('#signupName').value.trim());
      const email = Security.sanitizeInput(qs('#signupEmail').value.trim().toLowerCase());
      const username = Security.sanitizeInput(qs('#signupUsername').value.trim().toLowerCase());
      const password = qs('#signupPass').value;
      const passwordConfirm = qs('#signupPassConfirm').value;
      
      // Basic validation
      if (!name || !email || !username || !password) {
        showMessage('Please fill in all fields.', 'error');
        return;
      }

      // Email validation
      if (!Security.validateEmail(email)) {
        showMessage('Please enter a valid email address.', 'error');
        return;
      }

      // Username validation (alphanumeric and underscore)
      if (!/^[a-z0-9_]+$/.test(username)) {
        showMessage('Username can only contain lowercase letters, numbers, and underscores.', 'error');
        return;
      }

      if (username.length < 3 || username.length > 20) {
        showMessage('Username must be between 3 and 20 characters.', 'error');
        return;
      }

      // Password validation
      const passwordValidation = Security.validatePasswordStrength(password);
      if (!passwordValidation.valid) {
        showMessage('Password requirements: ' + passwordValidation.errors.join(', '), 'error');
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
      
      // Create account with secure password hashing
      try {
        const hashedPassword = await Security.hashPassword(password, email); // Use email as salt
        
        accounts[email] = {
          name: Security.escapeHTML(name),
          email: email,
          username: username,
          passwordHash: hashedPassword,
          createdAt: Date.now(),
          lastLogin: null,
          failedLoginAttempts: 0
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
      } catch (error) {
        console.error('Error creating account:', error);
        showMessage('Error creating account. Please try again.', 'error');
      }
    });

    // Real-time password strength indicator
    const passwordInput = qs('#signupPass');
    const passwordConfirmInput = qs('#signupPassConfirm');
    
    if (passwordInput) {
      passwordInput.addEventListener('input', (e) => {
        const password = e.target.value;
        if (password.length > 0) {
          const validation = Security.validatePasswordStrength(password);
          const strengthColors = {
            weak: '#dc2626',
            medium: '#f59e0b',
            strong: '#16a34a'
          };
          
          // You can add visual feedback here if needed
          // e.g., update a password strength meter
        }
      });
    }
  }

  // Login (Secure with Rate Limiting)
  const loginForm = qs('#loginPageForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Sanitize inputs
      const identifier = Security.sanitizeInput(qs('#loginEmail').value.trim().toLowerCase());
      const password = qs('#loginPass').value;
      
      if (!identifier || !password) {
        showMessage('Please enter both email/username and password.', 'error');
        return;
      }

      // Check rate limiting
      const rateLimit = Security.checkRateLimit(identifier, 'login');
      if (!rateLimit.allowed) {
        showMessage(rateLimit.message, 'error');
        return;
      }
      
      const accounts = getAccounts();
      const account = accounts[identifier];
      
      if (!account) {
        // Record failed attempt without revealing if account exists
        Security.recordFailedAttempt(identifier, 'login');
        showMessage('Invalid email/username or password.', 'error');
        return;
      }
      
      // Verify password with secure hashing
      try {
        const hashedPassword = await Security.hashPassword(password, account.email);
        
        if (account.passwordHash !== hashedPassword) {
          // Record failed attempt
          const attemptResult = Security.recordFailedAttempt(identifier, 'login');
          const remainingAttempts = rateLimit.maxAttempts - attemptResult.attempts;
          
          if (attemptResult.locked) {
            showMessage('Too many failed attempts. Account locked for 15 minutes.', 'error');
          } else {
            showMessage(`Invalid email/username or password. ${remainingAttempts} attempt(s) remaining.`, 'error');
          }
          return;
        }

        // Reset rate limiting on successful login
        Security.resetRateLimit(identifier, 'login');
        
        // Update account last login
        account.lastLogin = Date.now();
        account.failedLoginAttempts = 0;
        accounts[identifier] = account;
        if (account.username !== account.email) {
          accounts[account.username] = account;
        }
        if (account.email !== identifier) {
          accounts[account.email] = account;
        }
        saveAccounts(accounts);
        
        // Create secure session
        const userData = {
          email: account.email,
          username: account.username,
          name: account.name
        };
        
        const sessionId = Security.createSession(userData);
        
        if (!sessionId) {
          showMessage('Error creating session. Please try again.', 'error');
          return;
        }
        
        // Store login state (for backward compatibility)
        localStorage.setItem(currentUserKey, JSON.stringify(userData));
        localStorage.setItem('hd-logged-in', 'true');
        localStorage.setItem('hd-login-email', account.email);
        
        showMessage('Login successful! Redirecting...', 'success');
        
        // Initialize inactivity timer
        Security.initializeInactivityTimer();
        
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1000);
      } catch (error) {
        console.error('Error during login:', error);
        showMessage('Error during login. Please try again.', 'error');
      }
    });
  }

  function showMessage(text, type = 'info') {
    if (!messageEl) return;
    // Sanitize message text to prevent XSS
    messageEl.textContent = text;
    messageEl.className = `auth-message ${type}`;
    
    if (type === 'success') {
      setTimeout(() => {
        messageEl.textContent = '';
        messageEl.className = 'auth-message muted';
      }, 3000);
    }
  }

  // Check if user is logged in (Secure Session Check)
  function checkAuth() {
    // Use session validation instead of simple flag check
    const isValid = Security.isSessionValid();
    
    if (!isValid && window.location.pathname.includes('dashboard.html')) {
      Security.destroySession();
      window.location.href = 'login.html';
    } else if (isValid) {
      // Initialize inactivity timer on protected pages
      Security.initializeInactivityTimer();
    }
  }

  // Session validation on page load
  function initializeAuth() {
    // Check session validity
    const session = Security.getSession();
    
    if (session) {
      // Update last activity
      Security.initializeInactivityTimer();
    }
    
    // Run auth check for protected pages
    if (window.location.pathname.includes('dashboard.html')) {
      checkAuth();
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAuth);
  } else {
    initializeAuth();
  }
})();
