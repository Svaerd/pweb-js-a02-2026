const signupForm = document.getElementById("signup-form");
const firstNameInput = document.getElementById("firstName");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirm-password");
const signupBtn = document.getElementById("signup-btn");
const statusEl = document.getElementById("signup-status");

// If a session already exists, skip the registration form.
if (localStorage.getItem("firstName")) {
  window.location.href = "index.html";
}

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const firstName = firstNameInput.value.trim();
  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmInput.value;

  if (!firstName) {
    showStatus("Nama depan wajib diisi.", "error");
    return;
  }

  if (username.length < 3) {
    showStatus("Username minimal 3 karakter.", "error");
    return;
  }

  if (isUsernameTaken(username)) {
    showStatus("Username sudah dipakai. Pilih username lain.", "error");
    return;
  }

  if (password.length < 6) {
    showStatus("Password minimal 6 karakter.", "error");
    return;
  }

  if (password !== confirmPassword) {
    showStatus("Password tidak sama dengan konfirmasi.", "error");
    return;
  }

  setLoading(true);
  hideStatus();

  try {
    // Password disimpan sebagai hash SHA-256, bukan teks biasa.
    const passwordHash = await hashPassword(password);

    const users = getUsers();
    users.push({
      firstName,
      username,
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
    });
    saveUsers(users);

    // Langsung dianggap login supaya tidak perlu mengetik ulang.
    localStorage.setItem("firstName", firstName);

    showStatus("Akun berhasil dibuat! Mengarahkan...", "success");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 400);
  } catch (err) {
    showStatus("Gagal membuat akun. Coba lagi.", "error");
    console.error(err);
  } finally {
    setLoading(false);
  }
});

// UI helpers
function setLoading(isLoading) {
  signupBtn.disabled = isLoading;
  signupBtn.textContent = isLoading ? "Memuat..." : "Daftar";
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
