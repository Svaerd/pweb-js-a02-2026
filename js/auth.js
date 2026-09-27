// Device-local accounts (localStorage). Dipakai bersama oleh login.js & signup.js.
const USERS_KEY = "users";

// Hash selalu diawali penanda algoritma supaya akun yang dibuat di secure
// context (sha256) tetap bisa dicek kalau halaman dibuka lewat file://.
const SHA_PREFIX = "sha256:";
const FNV_PREFIX = "fnv1a:";

// FNV-1a 32-bit dengan dua seed, digabung jadi 64 bit hex. Bukan kriptografi,
// hanya fallback agar demo tetap jalan tanpa secure context.
function fnv1a(text, seed) {
  let hash = seed;

  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
}

function fallbackHash(password) {
  return FNV_PREFIX + fnv1a(password, 0x811c9dc5) + fnv1a(password, 0x9e3779b9);
}

// SHA-256 butuh secure context (https atau http://localhost). Tanpa itu pakai
// fallback, supaya signup dan login tetap berfungsi saat dibuka dari file://.
async function hashPassword(password) {
  if (!window.crypto?.subtle) {
    return fallbackHash(password);
  }

  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);

  const hex = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return SHA_PREFIX + hex;
}

// true = cocok, false = salah password, null = tidak bisa diverifikasi karena
// hash lama butuh SHA-256 tapi secure context tidak tersedia.
async function verifyPassword(password, storedHash) {
  if (storedHash.startsWith(SHA_PREFIX)) {
    if (!window.crypto?.subtle) return null;
    return (await hashPassword(password)) === storedHash;
  }

  return storedHash === fallbackHash(password);
}

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function findUserByUsername(username) {
  const target = username.trim().toLowerCase();
  return getUsers().find((u) => u.username.toLowerCase() === target) || null;
}

function isUsernameTaken(username) {
  return findUserByUsername(username) !== null;
}
