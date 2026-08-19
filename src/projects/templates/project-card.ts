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

export function renderProjectGrid(projects: readonly ProjectCardView[]): string {
  if (projects.length === 0) {
    return `      <p class="projects-empty">No projects are available right now. The lab is still running.</p>`;
  }
  return `      <div class="project-grid">
${projects.map(renderProjectCard).join("\n")}
      </div>`;
}
