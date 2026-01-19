/* =========================
   Security Utilities Module
   ========================= */

(function securityModule() {
  'use strict';

  /* =========================
     SHA-256 Password Hashing
     ========================= */
  async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async function hashPassword(password, salt = '') {
    // Use a salt for additional security
    const hash = await sha256(password + salt + 'hd-salt-2024');
    return hash;
  }

  /* =========================
     Password Validation
     ========================= */
  function validatePasswordStrength(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    const errors = [];
    
    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    }
    if (!hasUpperCase) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!hasLowerCase) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!hasNumbers) {
      errors.push('Password must contain at least one number');
    }
    if (!hasSpecialChar) {
      errors.push('Password must contain at least one special character (!@#$%^&*...)');
    }

    return {
      valid: errors.length === 0,
      errors: errors,
      strength: calculatePasswordStrength(password, hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar)
    };
  }

  function calculatePasswordStrength(password, hasUpper, hasLower, hasNum, hasSpecial) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (hasUpper && hasLower) strength++;
    if (hasNum) strength++;
    if (hasSpecial) strength++;
    if (password.length >= 16) strength++;
    
    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
  }

  /* =========================
     Input Sanitization (XSS Prevention)
     ========================= */
  function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    const div = document.createElement('div');
    div.textContent = input;
    const sanitized = div.innerHTML;
    
    // Remove any remaining script tags
    return sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }

  function sanitizeHTML(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  function escapeHTML(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /* =========================
     Rate Limiting (Brute Force Prevention)
     ========================= */
  function checkRateLimit(identifier, action = 'login') {
    const rateLimitKey = `hd-ratelimit-${action}`;
    const attemptsKey = `hd-attempts-${identifier}`;
    const maxAttempts = 5;
    const lockoutTime = 15 * 60 * 1000; // 15 minutes
    
    try {
      const rateLimitData = JSON.parse(localStorage.getItem(rateLimitKey) || '{}');
      const attemptsData = JSON.parse(localStorage.getItem(attemptsKey) || '{}');
      
      const now = Date.now();
      
      // Check if locked out
      if (attemptsData.lockedUntil && now < attemptsData.lockedUntil) {
        const remainingMinutes = Math.ceil((attemptsData.lockedUntil - now) / 60000);
        return {
          allowed: false,
          message: `Too many failed attempts. Please try again in ${remainingMinutes} minute(s).`
        };
      }
      
      // Reset if lockout expired
      if (attemptsData.lockedUntil && now >= attemptsData.lockedUntil) {
        attemptsData.count = 0;
        attemptsData.lockedUntil = null;
      }
      
      return {
        allowed: true,
        attempts: attemptsData.count || 0,
        maxAttempts: maxAttempts
      };
    } catch (e) {
      return { allowed: true, attempts: 0, maxAttempts: maxAttempts };
    }
  }

  function recordFailedAttempt(identifier, action = 'login') {
    const attemptsKey = `hd-attempts-${identifier}`;
    const maxAttempts = 5;
    const lockoutTime = 15 * 60 * 1000; // 15 minutes
    
    try {
      const attemptsData = JSON.parse(localStorage.getItem(attemptsKey) || '{}');
      attemptsData.count = (attemptsData.count || 0) + 1;
      
      if (attemptsData.count >= maxAttempts) {
        attemptsData.lockedUntil = Date.now() + lockoutTime;
      }
      
      localStorage.setItem(attemptsKey, JSON.stringify(attemptsData));
      
      return {
        attempts: attemptsData.count,
        maxAttempts: maxAttempts,
        locked: attemptsData.count >= maxAttempts
      };
    } catch (e) {
      return { attempts: 0, maxAttempts: maxAttempts, locked: false };
    }
  }

  function resetRateLimit(identifier, action = 'login') {
    const attemptsKey = `hd-attempts-${identifier}`;
    try {
      localStorage.removeItem(attemptsKey);
    } catch (e) {
      // Ignore errors
    }
  }

  /* =========================
     Session Management with Expiration
     ========================= */
  function createSession(userData) {
    const sessionId = generateSecureToken();
    const expiresAt = Date.now() + (2 * 60 * 60 * 1000); // 2 hours
    
    const session = {
      id: sessionId,
      user: userData,
      createdAt: Date.now(),
      expiresAt: expiresAt,
      lastActivity: Date.now()
    };
    
    try {
      localStorage.setItem('hd-session', JSON.stringify(session));
      localStorage.setItem('hd-session-id', sessionId);
      return sessionId;
    } catch (e) {
      return null;
    }
  }

  function getSession() {
    try {
      const sessionStr = localStorage.getItem('hd-session');
      if (!sessionStr) return null;
      
      const session = JSON.parse(sessionStr);
      const now = Date.now();
      
      // Check if expired
      if (session.expiresAt && now > session.expiresAt) {
        destroySession();
        return null;
      }
      
      // Update last activity
      session.lastActivity = now;
      localStorage.setItem('hd-session', JSON.stringify(session));
      
      return session;
    } catch (e) {
      return null;
    }
  }

  function destroySession() {
    try {
      localStorage.removeItem('hd-session');
      localStorage.removeItem('hd-session-id');
      localStorage.removeItem('hd-logged-in');
      localStorage.removeItem('hd-current-user');
    } catch (e) {
      // Ignore errors
    }
  }

  function isSessionValid() {
    const session = getSession();
    return session !== null;
  }

  /* =========================
     Auto Logout on Inactivity
     ========================= */
  let inactivityTimer;
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    
    if (!isSessionValid()) return;
    
    inactivityTimer = setTimeout(() => {
      destroySession();
      alert('You have been logged out due to inactivity. Please login again.');
      if (window.location.pathname.includes('dashboard.html')) {
        window.location.href = 'login.html';
      }
    }, INACTIVITY_TIMEOUT);
  }

  function initializeInactivityTimer() {
    if (!isSessionValid()) return;
    
    resetInactivityTimer();
    
    // Reset timer on user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, resetInactivityTimer, true);
    });
  }

  /* =========================
     Generate Secure Tokens
     ========================= */
  function generateSecureToken(length = 32) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /* =========================
     Simple Encryption for Sensitive Data
     ========================= */
  function simpleEncrypt(text, key = 'hd-encryption-key-2024') {
    // Simple XOR encryption (better than plain text, but not production-grade)
    // For production, use proper encryption libraries
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(result);
  }

  function simpleDecrypt(encrypted, key = 'hd-encryption-key-2024') {
    try {
      const text = atob(encrypted);
      let result = '';
      for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return result;
    } catch (e) {
      return '';
    }
  }

  /* =========================
     CSRF Protection
     ========================= */
  function generateCSRFToken() {
    const token = generateSecureToken(16);
    sessionStorage.setItem('hd-csrf-token', token);
    return token;
  }

  function getCSRFToken() {
    return sessionStorage.getItem('hd-csrf-token');
  }

  function validateCSRFToken(token) {
    const storedToken = getCSRFToken();
    return storedToken && storedToken === token;
  }

  /* =========================
     Email Validation
     ========================= */
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  /* =========================
     Export Security Functions
     ========================= */
  window.Security = {
    // Password functions
    hashPassword: hashPassword,
    validatePasswordStrength: validatePasswordStrength,
    
    // Input sanitization
    sanitizeInput: sanitizeInput,
    sanitizeHTML: sanitizeHTML,
    escapeHTML: escapeHTML,
    
    // Rate limiting
    checkRateLimit: checkRateLimit,
    recordFailedAttempt: recordFailedAttempt,
    resetRateLimit: resetRateLimit,
    
    // Session management
    createSession: createSession,
    getSession: getSession,
    destroySession: destroySession,
    isSessionValid: isSessionValid,
    initializeInactivityTimer: initializeInactivityTimer,
    
    // Token generation
    generateSecureToken: generateSecureToken,
    
    // Encryption
    simpleEncrypt: simpleEncrypt,
    simpleDecrypt: simpleDecrypt,
    
    // CSRF
    generateCSRFToken: generateCSRFToken,
    getCSRFToken: getCSRFToken,
    validateCSRFToken: validateCSRFToken,
    
    // Validation
    validateEmail: validateEmail
  };

  // Initialize inactivity timer if session exists
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      if (isSessionValid()) {
        initializeInactivityTimer();
      }
    });
  }
})();
