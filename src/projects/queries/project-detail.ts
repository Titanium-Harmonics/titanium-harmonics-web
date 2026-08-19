import type { ProjectSnapshot } from "../domain/project-snapshot.js";
import type { Milestone, Waypoint } from "../domain/roadmap.js";
import { formatIdentifier } from "./project-catalog.js";

export type RoadmapPhase = "past" | "now" | "future";
export type TimelineEntry =
  | (Waypoint & { displayStatus: string; phase: RoadmapPhase })
  | (Milestone & { displayStatus: string; phase: RoadmapPhase; completedIncludes: number });

export interface TimelineSection {
  phase: RoadmapPhase;
  label: "Past" | "Now" | "Future";
  entries: TimelineEntry[];
}

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
    sections: TimelineSection[];
    completed: number;
    active: number;
    planned: number;
    milestones: number;
  };
}

function phaseForEntry(entry: Waypoint | Milestone): RoadmapPhase {
  if (entry.type === "milestone") return entry.status === "planned" ? "future" : "past";
  if (["in_progress", "blocked"].includes(entry.status)) return "now";
  if (["planned", "idea"].includes(entry.status)) return "future";
  return "past";
}

function buildTimelineSections(entries: readonly (Waypoint | Milestone)[]): TimelineSection[] {
  const completed = new Set(entries
    .filter((entry): entry is Waypoint => entry.type === "waypoint" && entry.status === "completed")
    .map(({ id }) => id));
  const timeline = entries.map((entry): TimelineEntry => {
    return entry.type === "milestone"
      ? {
          ...entry,
          displayStatus: formatIdentifier(entry.status),
          phase: phaseForEntry(entry),
          completedIncludes: entry.includes.filter((id) => completed.has(id)).length,
        }
      : { ...entry, displayStatus: formatIdentifier(entry.status), phase: phaseForEntry(entry) };
  });

  return timeline.reduce<TimelineSection[]>((sections, entry) => {
    const current = sections.at(-1);
    if (current?.phase === entry.phase) current.entries.push(entry);
    else sections.push({ phase: entry.phase, label: formatIdentifier(entry.phase) as TimelineSection["label"], entries: [entry] });
    return sections;
  }, []);
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
        sections: buildTimelineSections(roadmap.entries),
        completed: roadmap.entries.filter((entry) => entry.type === "waypoint" && entry.status === "completed").length,
        active: roadmap.entries.filter((entry) => entry.type === "waypoint" && ["in_progress", "blocked"].includes(entry.status)).length,
        planned: roadmap.entries.filter((entry) => entry.type === "waypoint" && ["planned", "idea"].includes(entry.status)).length,
        milestones: roadmap.entries.filter((entry) => entry.type === "milestone").length,
      },
    } : {}),
  };
}
