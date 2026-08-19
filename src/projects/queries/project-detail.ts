import type { ProjectSnapshot } from "../domain/project-snapshot.js";
import type { Milestone, Waypoint } from "../domain/roadmap.js";
import { formatIdentifier } from "./project-catalog.js";

export interface ProjectDetailView {
  id: string;
  name: string;
  fullName?: string;
  summary: string;
  status: string;
  repositoryUrl: string;
  bannerUrl?: string;
  platforms: string[];
  technologies: string[];
  categories: string[];
  links: Array<{ label: string; url: string }>;
  roadmap?: {
    entries: Array<
      | (Omit<Waypoint, "status"> & { status: string })
      | (Omit<Milestone, "status"> & { status: string })
    >;
    completed: number;
    active: number;
    planned: number;
    milestones: number;
  };
}

export function getProjectDetail(snapshot: ProjectSnapshot): ProjectDetailView {
  const project = snapshot.project.project;
  const roadmap = snapshot.roadmap;
  const links = Object.entries(project.links)
    .filter((entry): entry is [string, string] => typeof entry[1] === "string")
    .map(([label, url]) => ({ label: formatIdentifier(label), url }));
  if (!links.some(({ url }) => url === project.repository.url)) {
    links.unshift({ label: "Repository", url: project.repository.url });
  }

  return {
    id: project.id,
    name: project.name,
    ...(project.fullName ? { fullName: project.fullName } : {}),
    summary: project.summary,
    status: formatIdentifier(project.status),
    repositoryUrl: project.repository.url,
    ...(snapshot.branding.banner ? { bannerUrl: snapshot.branding.banner.rawUrl } : {}),
    platforms: project.platforms.map(formatIdentifier),
    technologies: project.technologies.map(formatIdentifier),
    categories: project.categories.map(formatIdentifier),
    links,
    ...(roadmap ? {
      roadmap: {
        entries: roadmap.entries.map((entry) => ({ ...entry, status: formatIdentifier(entry.status) })),
        completed: roadmap.entries.filter((entry) => entry.type === "waypoint" && entry.status === "completed").length,
        active: roadmap.entries.filter((entry) => entry.type === "waypoint" && ["in_progress", "blocked"].includes(entry.status)).length,
        planned: roadmap.entries.filter((entry) => entry.type === "waypoint" && ["planned", "idea"].includes(entry.status)).length,
        milestones: roadmap.entries.filter((entry) => entry.type === "milestone").length,
      },
    } : {}),
  };
}

