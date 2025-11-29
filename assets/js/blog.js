// FILE: assets/js/blog.js

document.addEventListener("DOMContentLoaded", () => {
  const listContainer = document.querySelector(".blog-list");
  if (!listContainer) return;

  BLOG_POSTS.forEach(post => {
    const card = document.createElement("div");
    card.classList.add("blog-card", "fade");

    // Safely create excerpt from HTML content
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = post.content;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";
    const excerpt = textContent.length > 150 ? textContent.substring(0, 15000) + "..." : textContent;

    card.innerHTML = `
      <h3>${escapeHTML(post.title)}</h3>
      <span class="meta">${escapeHTML(post.date)} • ${escapeHTML(post.category)}</span>
      <p>${escapeHTML(excerpt)}</p>
      <a class="btn btn-outline" href="blog.html?post=${encodeURIComponent(post.id)}">
        Read More
      </a>
    `;

    listContainer.appendChild(card);
  });

  fadeInOnScroll();
});

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
