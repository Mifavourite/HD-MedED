// FILE: assets/js/blog.js

document.addEventListener("DOMContentLoaded", () => {
  const listContainer = document.querySelector(".blog-list");
  if (!listContainer) return;

  BLOG_POSTS.forEach(post => {
    const card = document.createElement("div");
    card.classList.add("blog-card", "fade");

    card.innerHTML = `
      <h3>${post.title}</h3>
      <span class="meta">${post.date} • ${post.category}</span>
      <p>${post.content.substring(0, 150)}...</p>

      <a class="btn btn-outline" href="blog.html?post=${post.id}">
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
