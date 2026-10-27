import { SITE_GITHUB_URL } from "./html.js";

export function renderBackToTop(): string {
  return `  <button class="back-to-top" type="button" aria-label="Back to top" aria-hidden="true" tabindex="-1">
    <span class="back-to-top-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M6 10l6-6 6 6M12 4v16" />
      </svg>
    </span>
  </button>
  <script>
    (() => {
      const navToggle = document.querySelector(".nav-toggle");
      const nav = document.querySelector(".nav");
      const pageIntro = document.querySelector(".hero, .projects-intro, .project-detail-hero");
      const backToTop = document.querySelector(".back-to-top");

      if (navToggle && nav) {
        const closeMenu = () => {
          navToggle.setAttribute("aria-expanded", "false");
          nav.classList.remove("nav-open");
        };
        navToggle.addEventListener("click", () => {
          const isOpen = navToggle.getAttribute("aria-expanded") === "true";
          navToggle.setAttribute("aria-expanded", String(!isOpen));
          nav.classList.toggle("nav-open", !isOpen);
        });
        nav.addEventListener("click", (event) => {
          if (event.target.closest("a")) closeMenu();
        });
        document.addEventListener("keydown", (event) => {
          if (event.key === "Escape") {
            closeMenu();
            navToggle.focus();
          }
        });
      }

      if (!pageIntro || !backToTop) return;

      const introObserver = new IntersectionObserver(([entry]) => {
        const isVisible = !entry.isIntersecting;
        backToTop.classList.toggle("back-to-top-visible", isVisible);
        backToTop.setAttribute("aria-hidden", String(!isVisible));
        backToTop.tabIndex = isVisible ? 0 : -1;
      });
      introObserver.observe(pageIntro);

      backToTop.addEventListener("click", () => {
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      });
    })();
  </script>`;
}

/** Shared by generated placeholder cards on the homepage and catalog. */
export function renderPlaceholderControls(): string {
  return `
  <script>
    document.querySelectorAll(".project-card-placeholder").forEach((card) => {
      const message = card.querySelector(".project-placeholder-message");
      if (!message) return;
      const messages = [
        "Hey! Get in line xD We told you to wait, didn’t we?",
        "Pressing it again won’t make it ship faster.",
        "Okay, okay. We’re working on it.",
        "You’re persistent. Respect. Maybe check GitHub while you wait?",
      ];
      let step = 0;
      let pending;
      const advance = () => {
        window.clearTimeout(pending);
        if (step === messages.length) {
          window.open(${JSON.stringify(SITE_GITHUB_URL)}, "_blank", "noopener,noreferrer");
          return;
        }
        message.textContent = messages[step++];
        if (step === 3) {
          pending = window.setTimeout(() => {
            message.textContent += " Probably.";
          }, 3000);
        }
      };
      card.addEventListener("click", advance);
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          if (!event.repeat) advance();
        }
      });
    });
  </script>`;
}
