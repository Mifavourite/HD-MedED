// ===== CORE FUNCTIONALITY =====
let visiblePosts = 3;
let currentPosts = [];
let currentFilter = 'all';
let currentSearch = '';

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// ===== MOBILE MENU =====
function initializeMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking on nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// ===== SMOOTH SCROLLING =====
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===== FORMS =====
function initializeForms() {
    // Join form
    const joinForm = document.querySelector('.join-form');
    if (joinForm) {
        joinForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for your interest! We will contact you soon.');
            this.reset();
        });
    }

    // Contact form
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for your message! We will get back to you soon.');
            this.reset();
        });
    }
}

// ===== NAVBAR SCROLL =====
function initializeNavbarScroll() {
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('nav');
        if (nav) {
            if (window.scrollY > 100) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        }
    });
}

// ===== ACTIVE NAV LINKS =====
function initializeActiveNavLinks() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// ===== ANIMATIONS =====
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.section').forEach(section => {
        observer.observe(section);
    });
}

// ===== BLOG FUNCTIONALITY =====
function initializeBlog() {
    loadBlogPosts();
    initializeBlogSearch();
    initializeBlogFilters();
    initializeLoadMore();
}

function initializeBlogSearch() {
    const searchInput = document.getElementById('blog-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            currentSearch = e.target.value;
            filterAndDisplayPosts();
        }, 300));
    }
}

function initializeBlogFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            filterAndDisplayPosts();
        });
    });
}

function initializeLoadMore() {
    const loadMoreBtn = document.getElementById('load-more');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            visiblePosts += 3;
            loadBlogPosts();
        });
    }
}

function filterAndDisplayPosts() {
    let filteredPosts = blogUtils.getSortedPosts();
    
    if (currentFilter !== 'all') {
        filteredPosts = blogUtils.getPostsByCategory(currentFilter);
    }
    
    if (currentSearch) {
        filteredPosts = blogUtils.searchPosts(currentSearch);
    }
    
    loadBlogPosts(filteredPosts.slice(0, visiblePosts));
}

// ===== SEO ANALYTICS & OPTIMIZATION =====
function initializeSEOTracking() {
    trackKeywordPerformance();
    updateSEOMetrics();
    optimizeInternalLinking();
}

function trackKeywordPerformance() {
    const searchInput = document.getElementById('blog-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            const searchTerm = e.target.value.toLowerCase();
            if (searchTerm.length > 2) {
                console.log('User searching for medical term:', searchTerm);
            }
        }, 1000));
    }
}

function updateSEOMetrics() {
    const stats = document.querySelectorAll('.stat-number');
    stats.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-count'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            stat.textContent = Math.floor(current);
        }, 16);
    });
}

function optimizeInternalLinking() {
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    internalLinks.forEach(link => {
        link.addEventListener('click', function() {
            const section = this.getAttribute('href').substring(1);
            console.log('User navigated to section:', section);
        });
    });
}

function loadBlogPosts(postsToShow = blogUtils.getSortedPosts().slice(0, visiblePosts)) {
    const blogContainer = document.getElementById('blog-posts');
    if (!blogContainer) return;

    currentPosts = postsToShow;

    if (currentPosts.length === 0) {
        blogContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No Medical Articles Found</h3>
                <p>Try different medical search terms or filter categories</p>
            </div>
        `;
        document.title = "Medical Education Search - Helpers Dynasty MedEd";
        return;
    }

    blogContainer.innerHTML = currentPosts.map(post => `
        <article class="blog-post-card" data-category="${post.category}" itemscope itemtype="https://schema.org/BlogPosting">
            <div class="post-header">
                <span class="post-category" itemprop="articleSection">${post.category}</span>
                <h3 class="post-title" itemprop="headline">${post.title}</h3>
                <div class="post-meta">
                    <span class="post-date" itemprop="datePublished">
                        <i class="far fa-calendar"></i>
                        ${formatDate(post.date)}
                    </span>
                    <span class="post-read-time">
                        <i class="far fa-clock"></i>
                        ${post.readTime}
                    </span>
                </div>
            </div>
            <div class="post-content" itemprop="articleBody">
                ${post.content}
            </div>
            <div class="post-tags">
                ${post.tags.map(tag => `<span class="post-tag" itemprop="keywords">#${tag}</span>`).join('')}
            </div>
            <meta itemprop="author" content="Helpers Dynasty MedEd">
            <meta itemprop="publisher" content="Helpers Dynasty MedEd">
        </article>
    `).join('');

    updatePageTitle();
}

function updatePageTitle() {
    let title = "Helpers Dynasty MedEd - Medical Education Blog";
    if (currentFilter !== 'all') {
        title = `${currentFilter} Medical Articles - Helpers Dynasty MedEd`;
    }
    if (currentSearch) {
        title = `Medical ${currentSearch} Search Results - Helpers Dynasty MedEd`;
    }
    document.title = title;
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('Helpers Dynasty MedEd - SEO Optimized Medical Education Platform Loaded! 🩺');
    
    initializeMobileMenu();
    initializeSmoothScrolling();
    initializeForms();
    initializeNavbarScroll();
    initializeActiveNavLinks();
    initializeAnimations();
    initializeBlog();
    initializeSEOTracking();
});
