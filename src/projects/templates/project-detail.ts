import type { ProjectDetailView } from "../queries/project-detail.js";
import { escapeHtml } from "./html.js";

function renderTags(title: string, tags: readonly string[]): string {
  if (tags.length === 0) return "";
  return `        <div class="project-fact">
          <h3>${escapeHtml(title)}</h3>
          <ul class="project-tags">
${tags.map((tag) => `            <li class="project-tag">${escapeHtml(tag)}</li>`).join("\n")}
          </ul>
        </div>`;
}

function renderRoadmap(project: ProjectDetailView): string {
  if (!project.roadmap) return "";
  const roadmap = project.roadmap;
  return `    <section class="project-detail-section roadmap-preview" aria-labelledby="roadmap-heading">
      <div class="detail-section-heading">
        <div>
          <p class="eyebrow">PROJECT ROADMAP</p>
          <h2 id="roadmap-heading">Engineering evolution.</h2>
        </div>
        <dl class="roadmap-summary" aria-label="Roadmap summary">
          <div><dt>Completed</dt><dd>${roadmap.completed}</dd></div>
          <div><dt>Current</dt><dd>${roadmap.active}</dd></div>
          <div><dt>Planned</dt><dd>${roadmap.planned}</dd></div>
          <div><dt>Milestones</dt><dd>${roadmap.milestones}</dd></div>
        </dl>
      </div>
      <ol class="roadmap-list">
${roadmap.entries.map((entry) => entry.type === "waypoint" ? `        <li class="roadmap-entry roadmap-waypoint" id="${escapeHtml(entry.id.toLowerCase())}">
          <div class="roadmap-entry-meta"><span>${escapeHtml(entry.id)}</span><span class="roadmap-status">${escapeHtml(entry.status)}</span></div>
          <h3>${escapeHtml(entry.title)}</h3>
          <p>${escapeHtml(entry.description)}</p>
${entry.dependsOn.length ? `          <p class="roadmap-relations">Depends on ${entry.dependsOn.map((id) => `<a href="#${escapeHtml(id.toLowerCase())}">${escapeHtml(id)}</a>`).join(", ")}</p>` : ""}
        </li>` : `        <li class="roadmap-entry roadmap-milestone" id="${escapeHtml(entry.id)}">
          <div class="roadmap-entry-meta"><span>MILESTONE ${escapeHtml(entry.id)}</span><span class="roadmap-status">${escapeHtml(entry.status)}</span></div>
          <h3>${escapeHtml(entry.title)}</h3>
          <p>${escapeHtml(entry.description)}</p>
          <p class="roadmap-relations">Includes ${entry.includes.map((id) => `<a href="#${escapeHtml(id.toLowerCase())}">${escapeHtml(id)}</a>`).join(", ")}</p>
        </li>`).join("\n")}
      </ol>
    </section>`;
}

export function renderProjectDetail(project: ProjectDetailView): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="${escapeHtml(project.summary)}" />
  <title>${escapeHtml(project.name)} — Titanium Harmonics</title>
  <link rel="stylesheet" href="/styles.css" />
  <link rel="stylesheet" href="/projects.css" />
</head>
<body>
  <header class="site-header">
    <a class="brand" href="/" aria-label="Titanium Harmonics home">
      <img class="brand-mark" src="/assets/wave_transparent_bg.png" alt="" aria-hidden="true" />
      <span>Titanium Harmonics</span>
    </a>
    <nav class="nav" aria-label="Main navigation">
      <a aria-current="page" href="/projects/">Projects</a>
      <a href="/#about">About</a>
      <a class="nav-cta" href="https://github.com/Titanium-Harmonics" target="_blank" rel="noreferrer">GitHub</a>
    </nav>
  </header>

  <main class="project-detail-page">
    <a class="detail-back-link" href="/projects/">← All projects</a>
    <section class="project-detail-hero">
      <div class="project-detail-copy">
        <div class="project-detail-kicker"><p class="eyebrow">PROJECT</p><span class="project-status">${escapeHtml(project.status.toUpperCase())}</span></div>
        <h1>${escapeHtml(project.name)}</h1>
${project.fullName ? `        <p class="project-detail-full-name">${escapeHtml(project.fullName)}</p>` : ""}
        <p class="project-detail-summary">${escapeHtml(project.summary)}</p>
        <a class="button button-primary" href="${escapeHtml(project.repositoryUrl)}" target="_blank" rel="noreferrer">View on GitHub ↗</a>
      </div>
${project.bannerUrl ? `      <div class="project-detail-banner"><img src="${escapeHtml(project.bannerUrl)}" alt="${escapeHtml(project.name)} project banner" /></div>` : ""}
    </section>

    <section class="project-detail-section" aria-labelledby="overview-heading">
      <p class="eyebrow">PROJECT OVERVIEW</p>
      <h2 id="overview-heading">Built with purpose.</h2>
      <div class="project-facts">
${renderTags("Platforms", project.platforms)}
${renderTags("Technologies", project.technologies)}
${renderTags("Categories", project.categories)}
      </div>
    </section>

${renderRoadmap(project)}

    <section class="project-detail-section project-links-section" aria-labelledby="links-heading">
      <p class="eyebrow">PROJECT LINKS</p>
      <h2 id="links-heading">Explore the project.</h2>
      <ul class="project-link-list">
${project.links.map(({ label, url }) => `        <li><a href="${escapeHtml(url)}" target="_blank" rel="noreferrer"><span>${escapeHtml(label)}</span><span aria-hidden="true">↗</span></a></li>`).join("\n")}
      </ul>
    </section>
  </main>

  <footer class="site-footer">
    <span>© 2026 Titanium Harmonics</span>
    <span class="footer-accent">Built because it seemed like a good idea (at the time xD).</span>
  </footer>
</body>
</html>`;
}

