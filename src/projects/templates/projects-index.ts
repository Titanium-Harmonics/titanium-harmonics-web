import type { ProjectCardView } from "../queries/project-catalog.js";
import { renderProjectGrid } from "./project-card.js";
import { renderBackToTop } from "./site-controls.js";

export function renderProjectsIndex(projects: readonly ProjectCardView[]): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="Explore engineering projects from Titanium Harmonics." />
  <title>Projects — Titanium Harmonics</title>
  <link rel="stylesheet" href="/styles.css" />
  <link rel="stylesheet" href="/projects.css" />
</head>
<body>
  <header class="site-header">
    <a class="brand" href="/" aria-label="Titanium Harmonics home">
      <img class="brand-mark" src="/assets/wave_transparent_bg.png" alt="" aria-hidden="true" />
      <span>Titanium Harmonics</span>
    </a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="main-navigation">
      <span>Menu</span>
      <span class="nav-toggle-icon" aria-hidden="true"></span>
    </button>
    <nav class="nav" id="main-navigation" aria-label="Main navigation">
      <a href="/">Home</a>
      <a aria-current="page" href="/projects/">Projects</a>
      <a href="/#contact">Contact</a>
      <a class="nav-cta" href="https://github.com/Titanium-Harmonics" target="_blank" rel="noreferrer">GitHub</a>
    </nav>
  </header>

  <main class="projects-page">
    <section class="projects-intro">
      <p class="eyebrow">PROJECT INDEX</p>
      <h1 class="projects-statement">Explore the things we build.</h1>
      <p>From early prototypes and failures to satisfying fixes and finished projects.</p>
    </section>
    <section aria-labelledby="project-list-heading">
      <h2 class="visually-hidden" id="project-list-heading">Titanium Harmonics projects</h2>
${renderProjectGrid(projects)}
    </section>
  </main>

  <footer class="site-footer">
    <span>© 2026 Titanium Harmonics</span>
    <span class="footer-accent">Built because it seemed like a good idea (at the time xD).</span>
  </footer>
${renderBackToTop()}
</body>
</html>`;
}
