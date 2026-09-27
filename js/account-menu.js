function initAccountMenu() {
  const accountBtn = document.getElementById("account-btn");
  const dropdown = document.getElementById("account-dropdown");
  const dropdownUsername = document.getElementById("dropdown-username");
  const logoutBtn = document.getElementById("logout-btn");

  if (!accountBtn || !dropdown) return;

  const firstName = localStorage.getItem("firstName");
  if (dropdownUsername) {
    dropdownUsername.textContent = firstName ? `Halo, ${firstName}` : "";
  }

  accountBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = dropdown.hidden;
    dropdown.hidden = !willOpen;
    accountBtn.setAttribute("aria-expanded", String(willOpen));
  });

  // Close the dropdown when clicking anywhere outside of it.
  document.addEventListener("click", (e) => {
    if (!dropdown.hidden && !dropdown.contains(e.target) && e.target !== accountBtn) {
      dropdown.hidden = true;
      accountBtn.setAttribute("aria-expanded", "false");
    }
  });

  // Close on Escape for accessibility.
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !dropdown.hidden) {
      dropdown.hidden = true;
      accountBtn.setAttribute("aria-expanded", "false");
    }
  });

  logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("firstName");
    window.location.href = "login.html";
  });
}

initAccountMenu();
