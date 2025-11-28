// Load posts from /data/posts.json
fetch("data/posts.json")
  .then(res => res.json())
  .then(posts => {
    window.blogPosts = posts;   // make available globally
    if (typeof renderBlogList === "function") renderBlogList(posts);
    if (typeof renderSinglePost === "function") renderSinglePost(posts);
  })
  .catch(err => console.error("Error loading posts:", err));
