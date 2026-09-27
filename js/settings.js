const PROFILE_KEY = "profile";
const CART_KEY = "cart";
// THEME_KEY sengaja tidak dideklarasikan di sini: sudah ada di account-menu.js.
// Dua script klasik berbagi scope global, jadi const kembar = SyntaxError.

// DOM refs 
const profileForm = document.getElementById("profile-form");
const nameInput = document.getElementById("profile-name");
const genderInput = document.getElementById("profile-gender");
const emailInput = document.getElementById("profile-email");
const phoneInput = document.getElementById("profile-phone");
const profileStatus = document.getElementById("profile-status");
const darkModeToggle = document.getElementById("dark-mode-toggle");
const cartCount = document.getElementById("cart-count");

// Sidebar navigation 
const navItems = document.querySelectorAll(".settings-nav-item");
const sections = document.querySelectorAll(".settings-section");

navItems.forEach((btn) => {
  btn.addEventListener("click", () => {
    navItems.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const target = btn.dataset.section;
    sections.forEach((sec) => {
      sec.hidden = sec.id !== `section-${target}`;
    });
  });
});

// AUTH GUARD
function checkAuthGuard() {
  if (!localStorage.getItem("firstName")) {
    window.location.href = "login.html";
  }
}

// PROFILE (Local Storage CRUD)
function getProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

function loadProfileIntoForm() {
  const profile = getProfile();
  const firstName = localStorage.getItem("firstName") || "";

  nameInput.value = profile.name || firstName;
  genderInput.value = profile.gender || "";
  emailInput.value = profile.email || "";
  phoneInput.value = profile.phone || "";
}

profileForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const profile = {
    name: nameInput.value.trim(),
    gender: genderInput.value,
    email: emailInput.value.trim(),
    phone: phoneInput.value.trim(),
  };

  saveProfile(profile);

  if (profile.name) {
    localStorage.setItem("firstName", profile.name);
  }

  profileStatus.textContent = "Perubahan berhasil disimpan.";
  profileStatus.hidden = false;
  profileStatus.classList.remove("status-error");
  profileStatus.classList.add("status-success");

  setTimeout(() => {
    profileStatus.hidden = true;
  }, 2500);
});

// THEME
function initThemeToggle() {
  if (!darkModeToggle) return;

  const isLight = localStorage.getItem(THEME_KEY) === "light";
  darkModeToggle.checked = isLight;
  document.body.classList.toggle("theme-light", isLight);

  darkModeToggle.addEventListener("change", () => {
    document.body.classList.toggle("theme-light", darkModeToggle.checked);
    localStorage.setItem(THEME_KEY, darkModeToggle.checked ? "light" : "dark");
  });
}

// CART BADGE (kept in sync across pages)
function updateCartBadge() {
  try {
    const cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    cartCount.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
  } catch {
    cartCount.textContent = 0;
  }
}

checkAuthGuard();
initThemeToggle();
loadProfileIntoForm();
updateCartBadge();
