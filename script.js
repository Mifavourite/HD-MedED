// ===== HELPERS DYNASTY MEDED WEBSITE JAVASCRIPT =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('Helpers Dynasty MedEd website loaded successfully! 🩺');
    
    // ===== MOBILE MENU TOGGLE =====
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
    
    // ===== SMOOTH SCROLLING =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Close mobile menu after clicking
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    hamburger.classList.remove('active');
                }
            }
        });
    });
    
    // ===== FORM HANDLING =====
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const formType = this.classList.contains('join-form') ? 'membership' : 'contact';
            
            // Simple validation
            let isValid = true;
            const inputs = this.querySelectorAll('input[required], textarea[required]');
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = 'var(--red)';
                } else {
                    input.style.borderColor = '#ccc';
                }
            });
            
            if (isValid) {
                // Simulate form submission
                if (formType === 'membership') {
                    alert('Thank you for your interest in Helpers Dynasty MedEd! We will contact you soon.');
                } else {
                    alert('Thank you for your message! We will get back to you soon.');
                }
                
                // Reset form
                this.reset();
            } else {
                alert('Please fill in all required fields.');
            }
        });
    });
    
    // ===== NAVBAR SCROLL EFFECT =====
    const navbar = document.querySelector('nav');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.background = 'var(--white)';
            navbar.style.backdropFilter = 'none';
        }
    });
    
    // ===== ACTIVE NAV LINK HIGHLIGHTING =====
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= (sectionTop - 100)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
    
    // ===== ANIMATIONS ON SCROLL =====
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.section');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };
    
    // Set initial styles for animation
    const sectionsToAnimate = document.querySelectorAll('.section');
    sectionsToAnimate.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
    
    // Run once on load
    animateOnScroll();
    
    // Run on scroll
    window.addEventListener('scroll', animateOnScroll);
    
    // ===== SOCIAL LINK TRACKING =====
    const socialLinks = document.querySelectorAll('.social-link');
    
    socialLinks.forEach(link => {
        link.addEventListener('click', function() {
            const platform = this.getAttribute('title') || 'social';
            console.log(`Social link clicked: ${platform}`);
        });
    });
});

// ===== UTILITY FUNCTIONS =====
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

// Export for potential future use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { debounce };
}
// ===== BLOG FUNCTIONALITY =====
let currentPosts = [];
let visiblePosts = 6;
let currentFilter = 'all';
let currentSearch = '';

function initializeBlog() {
    loadBlogPosts();
    setupBlogEventListeners();
    updateBlogStats();
}

function loadBlogPosts(postsToShow = blogUtils.getSortedPosts().slice(0, visiblePosts)) {
    const blogContainer = document.getElementById('blog-posts');
    if (!blogContainer) return;

    currentPosts = postsToShow;

    if (currentPosts.length === 0) {
        blogContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No articles found</h3>
                <p>Try adjusting your search or filter criteria</p>
            </div>
        `;
        return;
    }

    blogContainer.innerHTML = currentPosts.map(post => `
        <article class="blog-post-card" data-category="${post.category}">
            <div class="post-header">
                <span class="post-category">${post.category}</span>
                <h3 class="post-title">${post.title}</h3>
                <div class="post-meta">
                    <span class="post-date">
                        <i class="far fa-calendar"></i>
                        ${formatDate(post.date)}
                    </span>
                    <span class="post-read-time">
                        <i class="far fa-clock"></i>
                        ${post.readTime}
                    </span>
                </div>
            </div>
            <div class="post-content">
                ${post.content}
            </div>
            <div class="post-tags">
                ${post.tags.map(tag => `<span class="post-tag">#${tag}</span>`).join('')}
            </div>
        </article>
    `).join('');
}

function setupBlogEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('blog-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            currentSearch = e.target.value;
            applyFilters();
        }, 300));
    }

    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            applyFilters();
        });
    });

    // Load more button
    const loadMoreBtn = document.getElementById('load-more');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMorePosts);
    }
}

function applyFilters() {
    let filteredPosts = blogUtils.getSortedPosts();

    // Apply category filter
    if (currentFilter !== 'all') {
        filteredPosts = filteredPosts.filter(post => post.category === currentFilter);
    }

    // Apply search filter
    if (currentSearch) {
        filteredPosts = blogUtils.searchPosts(currentSearch);
    }

    loadBlogPosts(filteredPosts.slice(0, visiblePosts));
    updateBlogStats();
}

function loadMorePosts() {
    visiblePosts += 6;
    applyFilters();
    
    // Hide load more button if all posts are visible
    const totalPosts = currentFilter === 'all' ? 
        blogUtils.getTotalPosts() : 
        blogUtils.getPostsByCategory(currentFilter).length;
    
    if (visiblePosts >= totalPosts) {
        document.getElementById('load-more').style.display = 'none';
    }
}

function updateBlogStats() {
    const statsElement = document.getElementById('blog-stats');
    if (!statsElement) return;

    const totalPosts = blogUtils.getTotalPosts();
    const visibleCount = currentPosts.length;
    const categories = blogUtils.getCategories();

    statsElement.innerHTML = `
        Showing ${visibleCount} of ${totalPosts} articles | 
        ${Object.entries(categories).map(([cat, count]) => `${cat}: ${count}`).join(' | ')}
    `;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Update your existing DOMContentLoaded event
document.addEventListener('DOMContentLoaded', function() {
    console.log('Helpers Dynasty MedEd website loaded successfully! 🩺');
    
    // Your existing functionality
    initializeMobileMenu();
    initializeSmoothScrolling();
    initializeForms();
    initializeNavbarScroll();
    initializeActiveNavLinks();
    initializeAnimations();
    
    // NEW: Initialize blog
    initializeBlog();
});

// Your existing functions (keep them, just add the blog ones above)
function initializeMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
}

// ... keep all your other existing functions
