import { renderPlaceholderControls } from "./site-controls.js";
import type { ProjectCardView } from "../queries/project-catalog.js";
import { escapeHtml, sentenceCase } from "./html.js";

export function renderProjectCard(project: ProjectCardView): string {
  const tags = [project.platform, ...project.technologies].filter((tag): tag is string => Boolean(tag));
  return `        <article class="project-card">
${project.bannerUrl ? `          <div class="project-card-media">
            <img src="${escapeHtml(project.bannerUrl)}" alt="" loading="lazy" />
          </div>` : ""}
          <div class="project-card-kicker">
            <span class="project-status" data-status="${escapeHtml(project.status.toLowerCase())}">${escapeHtml(sentenceCase(project.status))}</span>
          </div>
          <h3>${escapeHtml(project.name)}</h3>
${project.fullName ? `          <p class="project-full-name">${escapeHtml(project.fullName)}</p>` : ""}
          <p>${escapeHtml(project.summary)}</p>
${tags.length > 0 ? `          <ul class="project-tags" aria-label="Platform and technologies">
${tags.map((tag) => `            <li class="project-tag">${escapeHtml(tag)}</li>`).join("\n")}
          </ul>` : ""}
          <a class="project-card-link" href="${escapeHtml(project.detailUrl)}" aria-label="Explore ${escapeHtml(project.name)}">View project</a>
        </article>`;
}

export interface ProjectGridOptions {
  showIncomingPlaceholder?: boolean;
}

function renderIncomingPlaceholder(): string {
  return `        <article class="project-card project-card-muted project-card-placeholder" role="button" tabindex="0" aria-label="More projects are taking shape">
          <div class="project-card-media">
            <img src="/assets/c_soon.png" alt="" loading="lazy" />
          </div>
          <div class="project-card-kicker">
            <span class="project-status">In the lab</span>
          </div>
          <h3>More projects are taking shape.</h3>
          <p class="project-full-name">New projects appear here once the work starts</p>
          <ul class="project-tags" aria-label="Project state">
            <li class="project-tag">Coming Soon</li>
          </ul>
          <p class="project-placeholder-message" aria-live="polite" aria-atomic="true"></p>
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
    cards.push(renderIncomingPlaceholder());
  }
  return `      <div class="project-grid">
${cards.join("\n")}
      </div>${options.showIncomingPlaceholder && projects.length < 3 ? renderPlaceholderControls() : ""}`;
}
