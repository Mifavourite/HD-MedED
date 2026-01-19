/* =========================
   Authentication System (Secure)
   ========================= */
const qs = s => document.querySelector(s);
const qsa = s => Array.from(document.querySelectorAll(s));

(function authModule() {
  'use strict';

  const accountsKey = 'hd-accounts';
  const currentUserKey = 'hd-current-user';
  const messageEl = qs('#authMessage');
  
  // Tab switching variables
  let tabs = null;
  let tabContents = null;

  // Initialize tab switching - MUST work independently
  function initTabSwitching() {
    tabs = qsa('.auth-tab');
    tabContents = qsa('.auth-tab-content');
    
    if (!tabs || tabs.length === 0 || !tabContents || tabContents.length === 0) {
      console.warn('Auth tabs not found - retrying...');
      setTimeout(initTabSwitching, 100);
      return;
    }
    
    console.log('Initializing tabs:', tabs.length);
    
    tabs.forEach(tab => {
      // Remove any existing listeners
      const newTab = tab.cloneNode(true);
      tab.parentNode.replaceChild(newTab, tab);
      
      // Add click listener
      newTab.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const targetTab = this.dataset.tab;
        console.log('Tab clicked:', targetTab);
        
        if (!targetTab) {
          console.error('Tab missing data-tab attribute');
          return;
        }
        
        // Remove active from all tabs
        const allTabs = qsa('.auth-tab');
        const allContents = qsa('.auth-tab-content');
        
        allTabs.forEach(t => t.classList.remove('active'));
        allContents.forEach(tc => tc.classList.remove('active'));
        
        // Add active to clicked tab
        this.classList.add('active');
        
        // Show corresponding content
        const targetContent = qs(`#${targetTab}Tab`);
        if (targetContent) {
          targetContent.classList.add('active');
          console.log('Switched to tab:', targetTab);
        } else {
          console.error(`Content #${targetTab}Tab not found`);
        }
        
        // Clear messages
        if (messageEl) messageEl.textContent = '';
      });
    });
    
    console.log('Tab switching initialized successfully');
  }

  // Run tab switching immediately when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTabSwitching);
  } else {
    initTabSwitching();
  }

  // Helper function
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

  // Check if Security module is loaded, if not, wait a bit
  function waitForSecurity(callback, maxAttempts = 10) {
    if (typeof window.Security !== 'undefined') {
      callback();
      return;
    }
    
    if (maxAttempts > 0) {
      setTimeout(() => waitForSecurity(callback, maxAttempts - 1), 100);
    } else {
      console.error('Security module not loaded after waiting');
      // Still allow basic functionality without Security
      showMessage('Security features unavailable. Please refresh the page.', 'error');
    }
  }

  // Initialize authentication features (requires Security module)
  waitForSecurity(function() {
    console.log('Security module loaded, initializing auth features');
    
    // Get accounts from localStorage
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
        
        const name = Security.sanitizeInput(qs('#signupName').value.trim());
        const email = Security.sanitizeInput(qs('#signupEmail').value.trim().toLowerCase());
        const username = Security.sanitizeInput(qs('#signupUsername').value.trim().toLowerCase());
        const password = qs('#signupPass').value;
        const passwordConfirm = qs('#signupPassConfirm').value;
        
        if (!name || !email || !username || !password) {
          showMessage('Please fill in all fields.', 'error');
          return;
        }

        if (!Security.validateEmail(email)) {
          showMessage('Please enter a valid email address.', 'error');
          return;
        }

        if (!/^[a-z0-9_]+$/.test(username)) {
          showMessage('Username can only contain lowercase letters, numbers, and underscores.', 'error');
          return;
        }

        if (username.length < 3 || username.length > 20) {
          showMessage('Username must be between 3 and 20 characters.', 'error');
          return;
        }

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
        
        if (accounts[email] || accounts[username]) {
          showMessage('Email or username already exists. Please use different credentials.', 'error');
          return;
        }
        
        try {
          const hashedPassword = await Security.hashPassword(password, email);
          
          accounts[email] = {
            name: Security.escapeHTML(name),
            email: email,
            username: username,
            passwordHash: hashedPassword,
            createdAt: Date.now(),
            lastLogin: null,
            failedLoginAttempts: 0
          };
          
          accounts[username] = accounts[email];
          saveAccounts(accounts);
          showMessage('Account created successfully! You can now login.', 'success');
          
          setTimeout(() => {
            const loginTab = qs('.auth-tab[data-tab="login"]');
            if (loginTab) loginTab.click();
            signupForm.reset();
          }, 1500);
        } catch (error) {
          console.error('Error creating account:', error);
          showMessage('Error creating account. Please try again.', 'error');
        }
      });
    }

    // Login (Secure with Rate Limiting)
    const loginForm = qs('#loginPageForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const identifier = Security.sanitizeInput(qs('#loginEmail').value.trim().toLowerCase());
        const password = qs('#loginPass').value;
        
        if (!identifier || !password) {
          showMessage('Please enter both email/username and password.', 'error');
          return;
        }

        const rateLimit = Security.checkRateLimit(identifier, 'login');
        if (!rateLimit.allowed) {
          showMessage(rateLimit.message, 'error');
          return;
        }
        
        const accounts = getAccounts();
        const account = accounts[identifier];
        
        if (!account) {
          Security.recordFailedAttempt(identifier, 'login');
          showMessage('Invalid email/username or password.', 'error');
          return;
        }
        
        try {
          const hashedPassword = await Security.hashPassword(password, account.email);
          
          if (account.passwordHash !== hashedPassword) {
            const attemptResult = Security.recordFailedAttempt(identifier, 'login');
            const remainingAttempts = rateLimit.maxAttempts - attemptResult.attempts;
            
            if (attemptResult.locked) {
              showMessage('Too many failed attempts. Account locked for 15 minutes.', 'error');
            } else {
              showMessage(`Invalid email/username or password. ${remainingAttempts} attempt(s) remaining.`, 'error');
            }
            return;
          }

          Security.resetRateLimit(identifier, 'login');
          
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
          
          localStorage.setItem(currentUserKey, JSON.stringify(userData));
          localStorage.setItem('hd-logged-in', 'true');
          localStorage.setItem('hd-login-email', account.email);
          
          showMessage('Login successful! Redirecting...', 'success');
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
  });

  // Session validation for dashboard
  if (window.location.pathname.includes('dashboard.html')) {
    waitForSecurity(function() {
      function checkAuth() {
        const isValid = Security.isSessionValid();
        if (!isValid) {
          Security.destroySession();
          window.location.href = 'login.html';
        } else {
          Security.initializeInactivityTimer();
        }
      }
      checkAuth();
    });
  }
})();
