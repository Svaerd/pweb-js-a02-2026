const PRODUCTS_API = "https://dummyjson.com/products?limit=0";
const PAGE_SIZE = 8; 
const CART_KEY = "cart";
const WISHLIST_KEY = "wishlist";

// State 
let allProducts = [];      // full list fetched from the API
let filteredProducts = []; // after search/filter/sort applied
let visibleCount = PAGE_SIZE;

// DOM refs ]
const productGrid = document.getElementById("product-grid");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const sortSelect = document.getElementById("sort-select");
const loadMoreBtn = document.getElementById("load-more-btn");
const globalError = document.getElementById("global-error");
const cartCount = document.getElementById("cart-count");
const resultCount = document.getElementById("result-count");
const modalWishlistBtn = document.getElementById("modal-wishlist-btn");

const modal = document.getElementById("product-modal");
const modalClose = document.getElementById("modal-close");
const modalImage = document.getElementById("modal-image");
const modalTitle = document.getElementById("modal-title");
const modalBrand = document.getElementById("modal-brand");
const modalPriceRating = document.getElementById("modal-price-rating");
const modalStock = document.getElementById("modal-stock");
const modalDescription = document.getElementById("modal-description");
const modalCategory = document.getElementById("modal-category");
const modalAddCart = document.getElementById("modal-add-cart");

let currentModalProductId = null;

// AUTH GUARD
function checkAuthGuard() {
  const firstName = localStorage.getItem("firstName");
  if (!firstName) {
    window.location.href = "login.html";
  }
}

// 2. FETCH PRODUCTS
async function loadProducts() {
  try {
    const res = await fetch(PRODUCTS_API);
    if (!res.ok) throw new Error("Gagal memuat produk.");

    const data = await res.json();
    allProducts = data.products || [];

    populateCategoryOptions(allProducts);
    applyFiltersAndRender();
    globalError.hidden = true;
  } catch (err) {
    globalError.textContent = "Gagal memuat produk. Periksa koneksi Anda dan muat ulang halaman.";
    globalError.hidden = false;
    console.error(err);
  }
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

// 3. SEARCH (Debounce via Closure)
function debounce(fn, delay) {
  let timerId;
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), delay);
  };
}

const debouncedSearch = debounce(applyFiltersAndRender, 300);
searchInput.addEventListener("input", debouncedSearch);

// 4. FILTER + SORT (Functional Programming)
function applyFiltersAndRender() {
  const term = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;

  filteredProducts = allProducts
    .filter(
      (p) =>
        !term ||
        p.title.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
    )
    .filter((p) => !category || p.category === category);

  switch (sortSelect.value) {
    case "price-asc":
      filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);
      break;
    case "rating-desc":
      filteredProducts = [...filteredProducts].sort((a, b) => b.rating - a.rating);
      break;
  }

  visibleCount = PAGE_SIZE; 
  renderProducts();
}

categoryFilter.addEventListener("change", applyFiltersAndRender);
sortSelect.addEventListener("change", applyFiltersAndRender);

// 5. RENDER PRODUCT GRID + PAGINATION (array slicing)
function renderProducts() {
  const slice = filteredProducts.slice(0, visibleCount);
  productGrid.innerHTML = slice.map(createCardHTML).join("");

  loadMoreBtn.hidden = visibleCount >= filteredProducts.length;
  resultCount.textContent = `${filteredProducts.length} produk ditemukan`;
}

function createCardHTML(product) {
  const hasDiscount = product.discountPercentage > 0;
  const wishlisted = isInWishlist(product.id);
  return `
    <div class="product-card" data-id="${product.id}">
      ${hasDiscount ? `<span class="discount-badge">-${Math.round(product.discountPercentage)}%</span>` : ""}
      <button class="wishlist-btn ${wishlisted ? "active" : ""}" data-id="${product.id}" aria-label="Tambah ke wishlist">
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

loadMoreBtn.addEventListener("click", () => {
  visibleCount += PAGE_SIZE;
  renderProducts();
});

// 6. EVENT DELEGATION on #product-grid
productGrid.addEventListener("click", (e) => {
  const wishlistBtn = e.target.closest(".wishlist-btn");
  if (wishlistBtn) {
    toggleWishlist(wishlistBtn.dataset.id);
    return;
  }

  const addBtn = e.target.closest(".add-to-cart-btn");
  if (addBtn) {
    addToCart(addBtn.dataset.id);
    return;
  }

  const card = e.target.closest(".product-card");
  if (card) {
    openModal(card.dataset.id);
  }
});

// 7. PRODUCT DETAIL MODAL
function openModal(productId) {
  const product = allProducts.find((p) => String(p.id) === String(productId));
  if (!product) return;

  currentModalProductId = product.id;

  modalImage.src = product.thumbnail;
  modalImage.alt = product.title;
  modalCategory.textContent = product.category;
  modalTitle.textContent = product.title;
  modalBrand.textContent = `Brand: ${product.brand || "-"}`;
  modalPriceRating.textContent = `$${product.price.toFixed(2)} ★ ${product.rating}`;
  modalStock.textContent = `Stok tersedia: ${product.stock}`;
  modalDescription.textContent = product.description;
  updateModalWishlistIcon(product.id);

  modal.hidden = false;
}

function updateModalWishlistIcon(productId) {
  const wishlisted = isInWishlist(productId);
  modalWishlistBtn.classList.toggle("active", wishlisted);
}

modalAddCart.addEventListener("click", () => {
  if (currentModalProductId != null) {
    addToCart(currentModalProductId);
  }
});

modalWishlistBtn.addEventListener("click", () => {
  if (currentModalProductId != null) {
    toggleWishlist(currentModalProductId);
    updateModalWishlistIcon(currentModalProductId);
  }
});

modalClose.addEventListener("click", () => {
  modal.hidden = true;
});

modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.hidden = true;
});

// CART (Local Storage CRUD)
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(productId) {
  const product = allProducts.find((p) => String(p.id) === String(productId));
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

function updateCartBadge() {
  const cart = getCart();
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.qty * item.price, 0);

  cartCount.textContent = totalQty;
  cartCount.title = `Total: $${totalPrice.toFixed(2)}`;
}

// WISHLIST (Local Storage CRUD)
function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
  } catch {
    return [];
  }
}

function saveWishlist(list) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
}

function isInWishlist(productId) {
  return getWishlist().some((item) => String(item.id) === String(productId));
}

function toggleWishlist(productId) {
  const product = allProducts.find((p) => String(p.id) === String(productId));
  if (!product) return;

  let wishlist = getWishlist();
  const exists = wishlist.some((item) => String(item.id) === String(productId));

  wishlist = exists
    ? wishlist.filter((item) => String(item.id) !== String(productId))
    : [...wishlist, product];

  saveWishlist(wishlist);
  renderProducts(); 
}

checkAuthGuard();
updateCartBadge();
loadProducts();
