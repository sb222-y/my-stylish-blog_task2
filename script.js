// ========= Utility Shortcuts =========
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const $  = (sel, ctx = document) => ctx.querySelector(sel);

// ========= Constants & Elements ======
const LS_KEY   = "myBlogPosts";
const postForm = $("#postForm");
const postsGrid = $("#postsGrid");

let editingId = null;

// ========= Load stored posts =========
document.addEventListener("DOMContentLoaded", () => {
  renderAllPosts();
});

// ========= Handle Form Submit ========
postForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const newPost = {
    id: editingId || Date.now(),
    title:   $("#title").value.trim(),
    author:  $("#author").value.trim(),
    image:   $("#image").value.trim(),
    content: $("#content").value.trim(),
    bullets: [$("#b1").value, $("#b2").value, $("#b3").value].filter(Boolean),
  };

  if (!newPost.title || !newPost.author || !newPost.image || !newPost.content) {
    alert("All fields are required.");
    return;
  }

  let posts = getPosts();

  if (editingId) {
    posts = posts.map((p) => (p.id === editingId ? newPost : p));
    editingId = null;
    postForm.querySelector("button[type='submit']").textContent = "Create Post";
  } else {
    posts.push(newPost);
  }

  savePosts(posts);
  postForm.reset();
  renderAllPosts();
});

// ========= LocalStorage Helpers ======
function getPosts() {
  return JSON.parse(localStorage.getItem(LS_KEY)) || [];
}
function savePosts(posts) {
  localStorage.setItem(LS_KEY, JSON.stringify(posts));
}

// ========= Render Helpers ============
function renderAllPosts() {
  postsGrid.innerHTML = "";
  getPosts().forEach((post, i) => renderPost(post, i));
}

function renderPost(post, index = 0) {
  const el = document.createElement("article");
  el.className = "blog-post";            // start hidden (CSS sets opacity 0 / translateY(30px))

  el.innerHTML = `
    <img src="${sanitizeURL(post.image)}" alt="${escapeHTML(post.title)}">
    <div class="content">
      <h3>${escapeHTML(post.title)}</h3>
      <p class="meta">by ${escapeHTML(post.author)}</p>
      <p>${escapeHTML(post.content)}</p>
      ${
        post.bullets.length
          ? `<ul>${post.bullets.map(b => `<li>${escapeHTML(b)}</li>`).join("")}</ul>`
          : ""
      }
      <div class="actions">
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
      </div>
    </div>
  `;

  // ===== Buttons =====
  el.querySelector(".edit-btn").addEventListener("click", () => {
    $("#title").value   = post.title;
    $("#author").value  = post.author;
    $("#image").value   = post.image;
    $("#content").value = post.content;
    $("#b1").value = post.bullets[0] || "";
    $("#b2").value = post.bullets[1] || "";
    $("#b3").value = post.bullets[2] || "";
    editingId = post.id;
    postForm.querySelector("button[type='submit']").textContent = "Update Post";
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  el.querySelector(".delete-btn").addEventListener("click", () => {
    if (confirm("Delete this post?")) {
      const updated = getPosts().filter(p => p.id !== post.id);
      savePosts(updated);
      renderAllPosts();
    }
  });

  // Add to DOM first
  postsGrid.prepend(el);

  // ===== Trigger animation after a tiny delay =====
  setTimeout(() => el.classList.add("loaded"), index * 100);
}

// ========= Security Helpers ==========
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[c]));
}
function sanitizeURL(url) {
  try { return new URL(url).href; }
  catch { return "https://via.placeholder.com/400x200?text=Invalid+URL"; }
}
