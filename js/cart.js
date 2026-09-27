const CART_KEY = "cart";

let cart = [];
let selectedIds = new Set(); 

// DOM refs 
const cartLayout = document.getElementById("cart-layout");
const cartList = document.getElementById("cart-list");
const selectAllCheckbox = document.getElementById("select-all-checkbox");
const emptyMessage = document.getElementById("empty-cart-message");
const cartCount = document.getElementById("cart-count");
const summaryItemCount = document.getElementById("summary-item-count");
const summaryTotalPrice = document.getElementById("summary-total-price");
const checkoutBtn = document.getElementById("checkout-btn");

// AUTH GUARD
function checkAuthGuard() {
  if (!localStorage.getItem("firstName")) {
    window.location.href = "login.html";
  }
}

// STORAGE HELPERS
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(list) {
  localStorage.setItem(CART_KEY, JSON.stringify(list));
}

// LOAD
function loadCart() {
  cart = getCart();
  selectedIds = new Set(cart.map((item) => String(item.id)));
  render();
}

// RENDER
function render() {
  const isEmpty = cart.length === 0;
  emptyMessage.hidden = !isEmpty;
  cartLayout.hidden = isEmpty;

  cartList.innerHTML = cart.map(createRowHTML).join("");

  const totalQtyInCart = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCount.textContent = totalQtyInCart;

  const selectedItems = cart.filter((item) => selectedIds.has(String(item.id)));
  const selectedQty = selectedItems.reduce((sum, item) => sum + item.qty, 0);
  const selectedTotal = selectedItems.reduce((sum, item) => sum + item.qty * item.price, 0);

  summaryItemCount.textContent = selectedQty;
  summaryTotalPrice.textContent = `$${selectedTotal.toFixed(2)}`;
  checkoutBtn.disabled = selectedItems.length === 0;

  updateSelectAllCheckboxState();
}

function updateSelectAllCheckboxState() {
  if (cart.length === 0) {
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = false;
    return;
  }

  if (selectedIds.size === 0) {
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = false;
  } else if (selectedIds.size === cart.length) {
    selectAllCheckbox.checked = true;
    selectAllCheckbox.indeterminate = false;
  } else {
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = true;
  }
}

function createRowHTML(item) {
  const subtotal = (item.price * item.qty).toFixed(2);
  const isChecked = selectedIds.has(String(item.id));
  return `
    <div class="cart-row" data-id="${item.id}">
      <input type="checkbox" class="item-select-checkbox" data-id="${item.id}" ${isChecked ? "checked" : ""} aria-label="Pilih ${item.title}" />

      <img src="${item.thumbnail}" alt="${item.title}" />

      <div class="cart-row-info">
        <p class="cart-row-title">${item.title}</p>
        <p class="cart-row-price">$${item.price.toFixed(2)}</p>
      </div>

      <div class="qty-stepper">
        <button class="qty-btn qty-decrease" data-id="${item.id}" aria-label="Kurangi jumlah">−</button>
        <span class="qty-value">${item.qty}</span>
        <button class="qty-btn qty-increase" data-id="${item.id}" aria-label="Tambah jumlah">+</button>
      </div>

      <p class="cart-row-subtotal">$${subtotal}</p>

      <button class="remove-cart-btn" data-id="${item.id}" aria-label="Hapus barang">🗑</button>
    </div>
  `;
}

// EVENT DELEGATION on #cart-list
cartList.addEventListener("click", (e) => {
  const increaseBtn = e.target.closest(".qty-increase");
  if (increaseBtn) {
    changeQty(increaseBtn.dataset.id, 1);
    return;
  }

  const decreaseBtn = e.target.closest(".qty-decrease");
  if (decreaseBtn) {
    changeQty(decreaseBtn.dataset.id, -1);
    return;
  }

  const removeBtn = e.target.closest(".remove-cart-btn");
  if (removeBtn) {
    removeItem(removeBtn.dataset.id);
  }
});

cartList.addEventListener("change", (e) => {
  const checkbox = e.target.closest(".item-select-checkbox");
  if (!checkbox) return;

  const id = String(checkbox.dataset.id);
  if (checkbox.checked) {
    selectedIds.add(id);
  } else {
    selectedIds.delete(id);
  }
  render();
});

selectAllCheckbox.addEventListener("change", () => {
  selectedIds = selectAllCheckbox.checked
    ? new Set(cart.map((item) => String(item.id)))
    : new Set();
  render();
});

function changeQty(productId, delta) {
  const item = cart.find((i) => String(i.id) === String(productId));
  if (!item) return;

  item.qty += delta;

  if (item.qty <= 0) {
    // Quantity dropped to zero -> remove the item entirely.
    cart = cart.filter((i) => String(i.id) !== String(productId));
    selectedIds.delete(String(productId));
  }

  saveCart(cart);
  render();
}

function removeItem(productId) {
  cart = cart.filter((i) => String(i.id) !== String(productId));
  selectedIds.delete(String(productId));
  saveCart(cart);
  render();
}

// CHECKOUT 
checkoutBtn.addEventListener("click", () => {
  const hasSelection = cart.some((item) => selectedIds.has(String(item.id)));
  if (!hasSelection) return;

  checkoutBtn.disabled = true;
  checkoutBtn.textContent = "Memproses...";

  // Simulate a short processing delay, then remove only the selected items from the cart.
  setTimeout(() => {
    const remainingCart = cart.filter((item) => !selectedIds.has(String(item.id)));
    saveCart(remainingCart);

    if (remainingCart.length === 0) {
      window.location.href = "index.html";
      return;
    }

    cart = remainingCart;
    selectedIds = new Set(cart.map((item) => String(item.id)));
    checkoutBtn.textContent = "Lanjut ke Pembayaran";
    render();
  }, 600);
});

checkAuthGuard();
loadCart();
