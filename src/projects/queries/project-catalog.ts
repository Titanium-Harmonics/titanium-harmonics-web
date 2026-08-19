import type { ProjectSnapshot } from "../domain/project-snapshot.js";

export interface ProjectCardView {
  id: string;
  name: string;
  fullName?: string;
  summary: string;
  status: string;
  platform?: string;
  technologies: string[];
  bannerUrl?: string;
  detailUrl: string;
}

export function formatIdentifier(identifier: string): string {
  return identifier
    .split(/[_-]+/)
    .filter(Boolean)
    .map((part) => part.length <= 3 ? part.toUpperCase() : `${part[0]?.toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export function listProjectCards(projects: readonly ProjectSnapshot[]): ProjectCardView[] {
  return projects.map(({ project, branding }) => {
    const value = project.project;
    return {
      id: value.id,
      name: value.name,
      ...(value.fullName ? { fullName: value.fullName } : {}),
      summary: value.summary,
      status: formatIdentifier(value.status),
      ...(value.platforms[0] ? { platform: formatIdentifier(value.platforms[0]) } : {}),
      technologies: value.technologies.slice(0, 3).map(formatIdentifier),
      ...(branding.banner ? { bannerUrl: branding.banner.rawUrl } : {}),
      detailUrl: `/projects/${encodeURIComponent(value.id)}/`,
    };
  });
}
