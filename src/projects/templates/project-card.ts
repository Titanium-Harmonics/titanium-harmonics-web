import type { ProjectCardView } from "../queries/project-catalog.js";
import { escapeHtml } from "./html.js";

export function renderProjectCard(project: ProjectCardView, index: number): string {
  const tags = [project.platform, ...project.technologies].filter((tag): tag is string => Boolean(tag));
  return `        <article class="project-card">
${project.bannerUrl ? `          <div class="project-card-media">
            <img src="${escapeHtml(project.bannerUrl)}" alt="" loading="lazy" />
          </div>` : ""}
          <div class="project-card-kicker">
            <span class="project-number">${String(index + 1).padStart(2, "0")}</span>
            <span class="project-status">${escapeHtml(project.status.toUpperCase())}</span>
          </div>
          <h3>${escapeHtml(project.name)}</h3>
${project.fullName ? `          <p class="project-full-name">${escapeHtml(project.fullName)}</p>` : ""}
          <p>${escapeHtml(project.summary)}</p>
${tags.length > 0 ? `          <ul class="project-tags" aria-label="Platform and technologies">
${tags.map((tag) => `            <li class="project-tag">${escapeHtml(tag)}</li>`).join("\n")}
          </ul>` : ""}
          <a class="project-card-link" href="${escapeHtml(project.detailUrl)}" aria-label="Explore ${escapeHtml(project.name)}">Explore project</a>
        </article>`;
}

export interface ProjectGridOptions {
  showIncomingPlaceholder?: boolean;
}

function renderIncomingPlaceholder(index: number): string {
  return `        <article class="project-card project-card-muted project-card-placeholder">
          <div class="project-card-media">
            <img src="/assets/c_soon.png" alt="" loading="lazy" />
          </div>
          <div class="project-card-kicker">
            <span class="project-number">${String(index + 1).padStart(2, "0")}</span>
            <span class="project-status">IN THE LAB</span>
          </div>
          <h3>More projects are taking shape.</h3>
          <p class="project-full-name">New projects appear here once the work starts</p>
          <ul class="project-tags" aria-label="Project state">
            <li class="project-tag">Coming Soon</li>
          </ul>
        </article>`;
}

export function renderProjectGrid(projects: readonly ProjectCardView[], options: ProjectGridOptions = {}): string {
  if (projects.length === 0) {
    if (!options.showIncomingPlaceholder) {
      return `      <p class="projects-empty">No projects are available right now. The lab is still running.</p>`;
    }
  }
  const cards = projects.map(renderProjectCard);
  if (options.showIncomingPlaceholder && projects.length < 3) {
    cards.push(renderIncomingPlaceholder(projects.length));
  }
  return `      <div class="project-grid">
${cards.join("\n")}
      </div>`;
}
