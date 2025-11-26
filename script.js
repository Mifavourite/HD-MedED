```javascript
counters.forEach(counter => {
const target = +counter.getAttribute('data-target');
let count = 0;


const updateCounter = () => {
if (count < target) {
count += Math.ceil(target / 120);
counter.innerText = count;
requestAnimationFrame(updateCounter);
} else {
counter.innerText = target;
}
};


updateCounter();
});
}


// Theme Switcher
function initThemeSwitcher() {
const toggle = document.createElement('button');
toggle.id = 'themeToggle';
toggle.textContent = '🌙';
document.body.appendChild(toggle);


toggle.addEventListener('click', () => {
document.body.classList.toggle('dark');
toggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
});
}


// Member Login Validation
function initLoginValidation() {
const form = document.querySelector('#loginForm');
if (!form) return;


form.addEventListener('submit', e => {
const username = document.querySelector('#username');
const password = document.querySelector('#password');


if (username.value.trim() === '' || password.value.trim() === '') {
e.preventDefault();
alert('Please enter both username and password.');
}
});
}


// Initialize Everything


document.addEventListener('DOMContentLoaded', () => {
initMobileMenu();
initSmoothScroll();
initFadeIn();
initBackToTop();
initCarousel();
initCounters();
initThemeSwitcher();
initLoginValidation();
console.log('Website initialized with full interactive features!');
});
```
