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
