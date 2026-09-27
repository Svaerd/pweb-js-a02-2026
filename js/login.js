const USERS_API = "https://dummyjson.com/users?limit=0";

const form = document.getElementById("login-form");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");
const statusEl = document.getElementById("login-status");

// If a session already exists, skip straight to the catalog.
if (localStorage.getItem("firstName")) {
  window.location.href = "index.html";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) {
    showStatus("Username dan password wajib diisi.", "error");
    return;
  }

  setLoading(true);
  hideStatus();

  try {
    const res = await fetch(USERS_API);

    if (!res.ok) {
      throw new Error("Gagal terhubung ke server.");
    }

    const data = await res.json();
    const users = data.users || [];

    // Autentikasi API: cocokkan username & password dengan data pengguna
    // dari https://dummyjson.com/users.
    const matchedUser = users.find(
      (u) => u.username === username && u.password === password
    );

    if (!matchedUser) {
      showStatus("Username atau password salah.", "error");
      return;
    }

    // Session Persistence: simpan firstName pengguna.
    localStorage.setItem("firstName", matchedUser.firstName);

    showStatus("Login berhasil! Mengarahkan...", "success");

    // Auto Redirect ke halaman katalog produk.
    setTimeout(() => {
      window.location.href = "index.html";
    }, 400);
  } catch (err) {
    showStatus("Terjadi kesalahan. Periksa koneksi Anda dan coba lagi.", "error");
    console.error(err);
  } finally {
    setLoading(false);
  }
});

// UI helpers 
function setLoading(isLoading) {
  loginBtn.disabled = isLoading;
  loginBtn.textContent = isLoading ? "Memuat..." : "Masuk";
}

function showStatus(message, type) {
  statusEl.textContent = message;
  statusEl.hidden = false;
  statusEl.classList.remove("status-error", "status-success");
  statusEl.classList.add(type === "error" ? "status-error" : "status-success");
}

function hideStatus() {
  statusEl.hidden = true;
  statusEl.textContent = "";
}
