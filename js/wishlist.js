const WISHLIST_KEY = "wishlist";
const CART_KEY = "cart";
const PAGE_SIZE = 8;

// State
let wishlistItems = [];   // seluruh isi wishlist dari localStorage
let visibleItems = [];    // setelah search/filter/sort, sebelum slicing
let visibleCount = PAGE_SIZE;

// DOM refs
const wishlistGrid = document.getElementById("wishlist-grid");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const sortSelect = document.getElementById("sort-select");
const loadMoreBtn = document.getElementById("load-more-btn");
const resultCount = document.getElementById("result-count");
const emptyMessage = document.getElementById("empty-wishlist-message");
const cartCount = document.getElementById("cart-count");

// AUTH GUARD
function checkAuthGuard() {
  if (!localStorage.getItem("firstName")) {
    window.location.href = "login.html";
  }
}

// STORAGE HELPERS
function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
  } catch {
    return [];
  }
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  if (cart.length === 0) {
    localStorage.removeItem(CART_KEY);
  } else {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }
  updateCartBadge();
}

// SEARCH (Debounce via Closure)
function debounce(fn, delay) {
  let timerId;
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), delay);
  };
}

const debouncedSearch = debounce(applyFiltersAndRender, 300);
searchInput.addEventListener("input", debouncedSearch);

// FILTER + SORT (Functional Programming)
function applyFiltersAndRender() {
  const term = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;

  visibleItems = wishlistItems
    .filter(
      (p) =>
        !term ||
        p.title.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
    )
    .filter((p) => !category || p.category === category);

  switch (sortSelect.value) {
    case "price-asc":
      visibleItems = [...visibleItems].sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      visibleItems = [...visibleItems].sort((a, b) => b.price - a.price);
      break;
    case "rating-desc":
      visibleItems = [...visibleItems].sort((a, b) => b.rating - a.rating);
      break;
  }

  visibleCount = PAGE_SIZE;
  render();
}

categoryFilter.addEventListener("change", applyFiltersAndRender);
sortSelect.addEventListener("change", applyFiltersAndRender);

// RENDER (array slicing)
function render() {
  const isEmpty = wishlistItems.length === 0;
  emptyMessage.hidden = !isEmpty;
  wishlistGrid.hidden = isEmpty;

  if (isEmpty) {
    resultCount.textContent = "";
    loadMoreBtn.hidden = true;
    return;
  }

  const slice = visibleItems.slice(0, visibleCount);
  wishlistGrid.innerHTML = slice.map(createCardHTML).join("");

  loadMoreBtn.hidden = visibleCount >= visibleItems.length;
  resultCount.textContent = `${visibleItems.length} produk di wishlist`;
}

function createCardHTML(product) {
  const hasDiscount = product.discountPercentage > 0;

  return `
    <div class="product-card" data-id="${product.id}">
      ${hasDiscount ? `<span class="discount-badge">-${Math.round(product.discountPercentage)}%</span>` : ""}
      <button class="wishlist-btn active" data-id="${product.id}" aria-label="Hapus dari wishlist">
        <img src="img/Shopicons_Regular_Heart.svg" alt="" class="wishlist-heart-img" />
      </button>
      <img src="${product.thumbnail}" alt="${product.title}" loading="lazy" />
      <p class="product-category">${product.category}</p>
      <h3 class="product-title">${product.title}</h3>
      <p class="product-price">$${product.price.toFixed(2)} <span class="product-rating">★ ${product.rating}</span></p>
      <button class="add-to-cart-btn" data-id="${product.id}">Tambah ke Keranjang</button>
    </div>
  `;
}

// EVENT DELEGATION on #wishlist-grid
wishlistGrid.addEventListener("click", (e) => {
  const removeBtn = e.target.closest(".wishlist-btn");
  if (removeBtn) {
    removeFromWishlist(removeBtn.dataset.id);
    return;
  }

  const addBtn = e.target.closest(".add-to-cart-btn");
  if (addBtn) {
    addToCart(addBtn.dataset.id);
  }
});

loadMoreBtn.addEventListener("click", () => {
  visibleCount += PAGE_SIZE;
  render();
});

// CRUD
function addToCart(productId) {
  const product = wishlistItems.find((p) => String(p.id) === String(productId));
  if (!product) return;

  const cart = getCart();
  const existing = cart.find((item) => String(item.id) === String(productId));

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      thumbnail: product.thumbnail,
      qty: 1,
    });
  }

  saveCart(cart);
}

function removeFromWishlist(productId) {
  wishlistItems = getWishlist().filter((item) => String(item.id) !== String(productId));
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistItems));
  applyFiltersAndRender();
}

function updateCartBadge() {
  const totalQty = getCart().reduce((sum, item) => sum + item.qty, 0);
  cartCount.textContent = totalQty;
}

function populateCategoryOptions(products) {
  const categories = [...new Set(products.map((p) => p.category))].sort();

  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

function loadWishlist() {
  wishlistItems = getWishlist();
  populateCategoryOptions(wishlistItems);
  applyFiltersAndRender();
}

checkAuthGuard();
updateCartBadge();
loadWishlist();
