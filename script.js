// ===== SEO ANALYTICS & OPTIMIZATION =====
function initializeSEOTracking() {
    trackKeywordPerformance();
    updateSEOMetrics();
    optimizeInternalLinking();
}

function trackKeywordPerformance() {
    // Track which keywords users are searching for
    const searchInput = document.getElementById('blog-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            const searchTerm = e.target.value.toLowerCase();
            if (searchTerm.length > 2) {
                console.log('User searching for medical term:', searchTerm);
                // In production, send this to analytics
            }
        }, 1000));
    }
}

function updateSEOMetrics() {
    // Update statistics with counting animation
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
    // Add click tracking to internal links for SEO analysis
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    internalLinks.forEach(link => {
        link.addEventListener('click', function() {
            const section = this.getAttribute('href').substring(1);
            console.log('User navigated to section:', section);
            // In production, send this to analytics
        });
    });
}

// Update your main initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('Helpers Dynasty MedEd - SEO Optimized Medical Education Platform Loaded! 🩺');
    
    // Existing functionality
    initializeMobileMenu();
    initializeSmoothScrolling();
    initializeForms();
    initializeNavbarScroll();
    initializeActiveNavLinks();
    initializeAnimations();
    initializeBlog();
    
    // NEW: SEO Optimization
    initializeSEOTracking();
});

// Enhanced blog loading with SEO metadata
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
        // Update page title for SEO
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

    // Update page title with current filter for SEO
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
