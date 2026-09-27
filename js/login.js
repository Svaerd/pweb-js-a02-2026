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
    // 1) Akun lokal hasil pendaftaran di signup.html (password disimpan sebagai hash).
    const localUser = findUserByUsername(username);
    if (localUser) {
      const passwordOk = await verifyPassword(password, localUser.passwordHash);

      if (passwordOk === null) {
        showStatus("Akun ini dibuat lewat https. Buka lewat Live Server untuk bisa memverifikasi passwordnya.", "error");
        return;
      }

      if (!passwordOk) {
        showStatus("Username atau password salah.", "error");
        return;
      }

      completeLogin(localUser.firstName);
      return;
    }

    // 2) Autentikasi API: cocokkan username & password dengan data pengguna
    // dari https://dummyjson.com/users.
    const res = await fetch(USERS_API);

    if (!res.ok) {
      throw new Error("Gagal terhubung ke server.");
    }

    const data = await res.json();
    const users = data.users || [];

    const matchedUser = users.find(
      (u) => u.username === username && u.password === password
    );

    if (!matchedUser) {
      showStatus("Username atau password salah.", "error");
      return;
    }

    completeLogin(matchedUser.firstName);
  } catch (err) {
    showStatus("Terjadi kesalahan. Periksa koneksi Anda dan coba lagi.", "error");
    console.error(err);
  } finally {
    setLoading(false);
  }
});

// Session Persistence + Auto Redirect
function completeLogin(firstName) {
  localStorage.setItem("firstName", firstName);
  showStatus("Login berhasil! Mengarahkan...", "success");

  setTimeout(() => {
    window.location.href = "index.html";
  }, 400);
}

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
