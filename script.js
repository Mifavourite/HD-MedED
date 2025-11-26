```javascript
console.log("Helpers Dynasty website loaded.");


// Mobile Navigation Menu
function initMobileMenu() {
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');


if (hamburger) {
hamburger.addEventListener('click', () => {
hamburger.classList.toggle('active');
navMenu.classList.toggle('active');
});
}
}


// Smooth Scrolling
function initSmoothScroll() {
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
anchor.addEventListener('click', function (e) {
e.preventDefault();
const target = document.querySelector(this.getAttribute('href'));
if (target) {
target.scrollIntoView({ behavior: 'smooth' });
}
});
});
}


// Fade-In Animations
function initFadeIn() {
const observer = new IntersectionObserver((entries) => {
entries.forEach(entry => {
if (entry.isIntersecting) {
entry.target.classList.add('visible');
}
});
});


document.querySelectorAll('.section, article').forEach(el => observer.observe(el));
}


// Back to Top Button
function initBackToTop() {
const btn = document.createElement('button');
