import type { ProjectDetailView } from "../queries/project-detail.js";
import type { TimelineWaypoint } from "../queries/project-detail.js";
import { escapeHtml } from "./html.js";
import { renderBackToTop } from "./site-controls.js";

function renderTags(title: string, tags: readonly string[]): string {
  if (tags.length === 0) return "";
  return `        <div class="project-fact">
          <h3>${escapeHtml(title)}</h3>
          <ul class="project-tags">
${tags.map((tag) => `            <li class="project-tag">${escapeHtml(tag)}</li>`).join("\n")}
          </ul>
        </div>`;
}

function renderWaypoint(entry: TimelineWaypoint): string {
  return `            <li class="roadmap-entry roadmap-waypoint roadmap-status-${escapeHtml(entry.status)}" id="${escapeHtml(entry.id.toLowerCase())}" data-roadmap-id="${escapeHtml(entry.id)}">
              <span class="roadmap-node" aria-hidden="true"></span>
              <div class="roadmap-entry-card">
                <div class="roadmap-entry-meta"><span>${escapeHtml(entry.id)}</span><span class="roadmap-status">${escapeHtml(entry.displayStatus)}</span></div>
                <h3>${escapeHtml(entry.title)}</h3>
                <p>${escapeHtml(entry.description)}</p>
${entry.dependsOn.length ? `                <p class="roadmap-relations">Depends on ${entry.dependsOn.map((id) => `<a href="#${escapeHtml(id.toLowerCase())}" data-roadmap-ref="${escapeHtml(id)}">${escapeHtml(id)}</a>`).join(", ")}</p>` : ""}
              </div>
            </li>`;
}

function renderRoadmap(project: ProjectDetailView): string {
  if (!project.roadmap) return "";
  const roadmap = project.roadmap;
  return `    <section class="project-detail-section roadmap-preview" aria-labelledby="roadmap-heading">
      <div class="detail-section-heading">
        <div>
          <p class="eyebrow">PROJECT ROADMAP</p>
          <h2 id="roadmap-heading">Project evolution.</h2>
        </div>
        <dl class="roadmap-summary" aria-label="Roadmap summary">
          <div><dt>Completed</dt><dd>${roadmap.completed}</dd></div>
          <div><dt>Current</dt><dd>${roadmap.active}</dd></div>
          <div><dt>Planned</dt><dd>${roadmap.planned}</dd></div>
          <div><dt>Milestones</dt><dd>${roadmap.milestones}</dd></div>
        </dl>
      </div>
      <div class="roadmap-timeline">
${roadmap.groups.map(({ milestone, waypoints }) => `        <details class="roadmap-milestone-group roadmap-status-${escapeHtml(milestone.status)}" id="${escapeHtml(milestone.id)}">
          <summary class="milestone-summary">
            <span class="milestone-summary-node" aria-hidden="true"></span>
            <span class="milestone-summary-content">
              <span class="roadmap-entry-meta"><span>MILESTONE ${escapeHtml(milestone.id)}</span><span class="roadmap-status">${escapeHtml(milestone.displayStatus)}</span></span>
              <strong>${escapeHtml(milestone.title)}</strong>
              <span class="milestone-description">${escapeHtml(milestone.description)}</span>
              <span class="milestone-progress"><span style="--milestone-progress: ${Math.round((milestone.completedIncludes / milestone.includes.length) * 100)}%"></span><span><b>${milestone.completedIncludes} of ${milestone.includes.length}</b> waypoints completed</span></span>
            </span>
            <span class="milestone-toggle" aria-hidden="true"></span>
          </summary>
          <ol class="roadmap-list milestone-waypoints">
${waypoints.map(renderWaypoint).join("\n")}
          </ol>
        </details>`).join("\n")}
${roadmap.unassigned.length ? `        <section class="roadmap-unassigned" aria-labelledby="unassigned-waypoints-heading">
          <h3 id="unassigned-waypoints-heading">Unversioned waypoints</h3>
          <ol class="roadmap-list">
${roadmap.unassigned.map(renderWaypoint).join("\n")}
          </ol>
        </section>` : ""}
      </div>
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
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="main-navigation">
      <span>Menu</span>
      <span class="nav-toggle-icon" aria-hidden="true"></span>
    </button>
    <nav class="nav" id="main-navigation" aria-label="Main navigation">
      <a aria-current="page" href="/projects/">Projects</a>
      <a href="/#contact">Contact</a>
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
      <div class="project-facts project-hero-facts">
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
${renderBackToTop()}
  <script>
    document.querySelectorAll("[data-roadmap-ref]").forEach((link) => {
      const target = document.querySelector('[data-roadmap-id="' + CSS.escape(link.dataset.roadmapRef) + '"]');
      if (!target) return;
      const toggle = (active) => target.classList.toggle("roadmap-entry-related", active);
      link.addEventListener("mouseenter", () => toggle(true));
      link.addEventListener("mouseleave", () => toggle(false));
      link.addEventListener("focus", () => toggle(true));
      link.addEventListener("blur", () => toggle(false));
      link.addEventListener("click", () => {
        const group = target.closest("details");
        if (group) group.open = true;
      });
    });
  </script>
</body>
</html>`;
}
