const topbar = document.querySelector(".topbar");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".nav a");
const themeToggle = document.querySelector("[data-theme-toggle]");
const exportResumeButton = document.querySelector("[data-export-resume]");
const backToTopButton = document.querySelector("[data-back-to-top]");
const navOverlay = document.querySelector("[data-nav-overlay]");
const root = document.documentElement;
const themeIcon = themeToggle?.querySelector("i");
const revealElements = document.querySelectorAll(".reveal");

root.classList.remove("no-js");

const storedTheme = localStorage.getItem("resume-theme");
const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const initialTheme = storedTheme || (systemPrefersDark ? "dark" : "light");

function applyTheme(theme) {
  if (theme === "dark") {
    root.dataset.theme = "dark";
    if (themeIcon) {
      themeIcon.className = "fa-solid fa-sun";
    }
  } else {
    delete root.dataset.theme;
    if (themeIcon) {
      themeIcon.className = "fa-solid fa-moon";
    }
  }
  localStorage.setItem("resume-theme", theme);
}

applyTheme(initialTheme);

navToggle?.addEventListener("click", () => {
  const expanded = topbar.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(expanded));
});

navOverlay?.addEventListener("click", () => {
  topbar.classList.remove("is-open");
  navToggle?.setAttribute("aria-expanded", "false");
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (window.innerWidth <= 760) {
      topbar.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
});

themeToggle?.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
});

exportResumeButton?.addEventListener("click", () => {
  window.print();
});

backToTopButton?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

function updateBackToTopVisibility() {
  if (!backToTopButton) {
    return;
  }

  backToTopButton.classList.toggle("is-visible", window.scrollY > 600);
}

updateBackToTopVisibility();
window.addEventListener("scroll", updateBackToTopVisibility, { passive: true });

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.18,
    rootMargin: "0px 0px -40px 0px",
  }
);

revealElements.forEach((element) => observer.observe(element));
