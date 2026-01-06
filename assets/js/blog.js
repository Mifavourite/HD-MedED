// FILE: assets/js/blog.js

document.addEventListener("DOMContentLoaded", () => {
  // Check if we're viewing a single post
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get("post");

  if (postId) {
    displaySinglePost(parseInt(postId));
  } else {
    displayPostList();
  }
});

function displayPostList() {
  const listContainer = document.querySelector(".blog-list");
  if (!listContainer) return;

  // Sort posts by date (newest first)
  const sortedPosts = [...BLOG_POSTS].sort((a, b) => new Date(b.date) - new Date(a.date));

  sortedPosts.forEach(post => {
    const card = document.createElement("div");
    card.classList.add("blog-card", "fade");

    // Safely create excerpt from HTML content
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = post.content;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";
    const excerpt = textContent.length > 200 ? textContent.substring(0, 200) + "..." : textContent;

    // Format date nicely
    const dateObj = new Date(post.date);
    const formattedDate = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    card.innerHTML = `
      <h3>${escapeHTML(post.title)}</h3>
      <span class="meta">${escapeHTML(formattedDate)} • ${escapeHTML(post.category)}</span>
      <p>${escapeHTML(excerpt)}</p>
      <a class="btn btn-outline" href="blog.html?post=${encodeURIComponent(post.id)}">
        Read More
      </a>
    `;

    listContainer.appendChild(card);
  });

  fadeInOnScroll();
}

function displaySinglePost(postId) {
  const post = BLOG_POSTS.find(p => p.id === postId);
  if (!post) {
    window.location.href = "blog.html";
    return;
  }

  const main = document.querySelector("main");
  if (!main) return;

  // Format date nicely
  const dateObj = new Date(post.date);
  const formattedDate = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  main.innerHTML = `
    <section class="container section fade">
      <a href="blog.html" class="btn btn-ghost" style="margin-bottom: 20px; display: inline-block;">← Back to All Posts</a>
      <article class="blog-post">
        <h2>${escapeHTML(post.title)}</h2>
        <p class="meta" style="margin-bottom: 24px;">${escapeHTML(formattedDate)} • ${escapeHTML(post.category)} • ${escapeHTML(post.author)}</p>
        <div class="post-content">
          ${post.content}
        </div>
      </article>
    </section>
  `;

  // Add fade animation
  fadeInOnScroll();
}

// fade animation
function fadeInOnScroll() {
  const fades = document.querySelectorAll(".fade");

  function check() {
    fades.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 50) {
        el.classList.add("visible");
      }
    });
  }

  window.addEventListener("scroll", check);
  check();
}

// Escape HTML to prevent injection
function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
