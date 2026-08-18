const topbar = document.querySelector(".topbar");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".nav a");
const themeToggle = document.querySelector("[data-theme-toggle]");
const exportResumeButton = document.querySelector("[data-export-resume]");
const backToTopButton = document.querySelector("[data-back-to-top]");
const navOverlay = document.querySelector("[data-nav-overlay]");
const visitorCountElement = document.querySelector("[data-visitor-count]");
const visitorCounterStatus = document.querySelector("#visitor-counter-status");
const root = document.documentElement;
const themeIcon = themeToggle?.querySelector("i");
const revealElements = document.querySelectorAll(".reveal");
const visitorCounterApiUrl =
  document.querySelector('meta[name="visitor-counter-api"]')?.content ||
  window.VISITOR_COUNTER_API_URL ||
  "";
const resumeFileUrl =
  document.querySelector('meta[name="resume-file"]')?.content ||
  "resume/Lokeshwaran_B_Resume.pdf";

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
  if (!resumeFileUrl) {
    return;
  }

  const fileName = resumeFileUrl.split("/").pop() || "Lokeshwaran_B_Resume.pdf";
  const resolvedResumeUrl = new URL(resumeFileUrl, window.location.href).href;
  const link = document.createElement("a");

  link.href = resolvedResumeUrl;
  link.download = fileName;
  link.target = "_blank";
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
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

async function updateVisitorCounter() {
  if (!visitorCountElement) {
    return;
  }

  if (!visitorCounterApiUrl) {
    if (visitorCounterStatus) {
      visitorCounterStatus.textContent = "Add your API Gateway endpoint to enable the live counter.";
    }
    visitorCountElement.textContent = "0000";
    return;
  }

  try {
    if (visitorCounterStatus) {
      visitorCounterStatus.textContent = "Updating count...";
    }

    const response = await fetch(visitorCounterApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "increment" }),
    });

    if (!response.ok) {
      throw new Error(`Visitor counter request failed with status ${response.status}`);
    }

    const data = await response.json();
    const count = Number(data.visitCount ?? data.count ?? 0);
    visitorCountElement.textContent = String(count).padStart(4, "0");

    if (visitorCounterStatus) {
      visitorCounterStatus.textContent = "Live counter powered by API Gateway, Lambda, and DynamoDB.";
    }
  } catch (error) {
    console.error("Failed to update visitor counter:", error);
    if (visitorCounterStatus) {
      visitorCounterStatus.textContent = "Live counter unavailable. Showing placeholder value.";
    }
    visitorCountElement.textContent = "0000";
  }
}

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
updateVisitorCounter();
