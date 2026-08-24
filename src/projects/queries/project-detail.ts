import type { ProjectSnapshot } from "../domain/project-snapshot.js";
import type { Milestone, Waypoint } from "../domain/roadmap.js";
import { formatIdentifier } from "./project-catalog.js";

export type TimelineWaypoint = Waypoint & { displayStatus: string };
export type TimelineMilestone = Milestone & { displayStatus: string; completedIncludes: number };

export interface MilestoneGroup {
  milestone: TimelineMilestone;
  waypoints: TimelineWaypoint[];
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
    groups: MilestoneGroup[];
    unassigned: TimelineWaypoint[];
    completed: number;
    active: number;
    planned: number;
    milestones: number;
  };
}

/**
 * Milestones own membership. Included waypoints retain their source order and
 * appear only inside their milestone; unassigned waypoints remain independent.
 * Groups are ordered by the last source waypoint included in each milestone.
 */
export function groupTimelineEntries(entries: readonly (Waypoint | Milestone)[]): {
  groups: MilestoneGroup[];
  unassigned: TimelineWaypoint[];
} {
  const waypoints = entries.filter((entry): entry is Waypoint => entry.type === "waypoint");
  const waypointIndex = new Map(waypoints.map((waypoint, index) => [waypoint.id, index]));
  const completed = new Set(entries
    .filter((entry): entry is Waypoint => entry.type === "waypoint" && entry.status === "completed")
    .map(({ id }) => id));
  const waypointById = new Map(waypoints.map((waypoint) => [waypoint.id, waypoint]));
  const assigned = new Set<string>();
  const groups = entries
    .filter((entry): entry is Milestone => entry.type === "milestone")
    .map((milestone) => {
      const included = new Set(milestone.includes);
      milestone.includes.forEach((id) => assigned.add(id));
      return {
        anchor: Math.max(...milestone.includes.map((id) => waypointIndex.get(id) ?? -1)),
        group: {
          milestone: {
            ...milestone,
            displayStatus: formatIdentifier(milestone.status),
            completedIncludes: milestone.includes.filter((id) => completed.has(id)).length,
          },
          waypoints: waypoints
            .filter(({ id }) => included.has(id))
            .map((waypoint) => ({ ...waypoint, displayStatus: formatIdentifier(waypoint.status) })),
        },
      };
    })
    .sort((a, b) => a.anchor - b.anchor)
    .map(({ group }) => group);

  return {
    groups,
    unassigned: [...waypointById.values()]
      .filter(({ id }) => !assigned.has(id))
      .map((waypoint) => ({ ...waypoint, displayStatus: formatIdentifier(waypoint.status) })),
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
        ...groupTimelineEntries(roadmap.entries),
        completed: roadmap.entries.filter((entry) => entry.type === "waypoint" && entry.status === "completed").length,
        active: roadmap.entries.filter((entry) => entry.type === "waypoint" && ["in_progress", "blocked"].includes(entry.status)).length,
        planned: roadmap.entries.filter((entry) => entry.type === "waypoint" && ["planned", "idea"].includes(entry.status)).length,
        milestones: roadmap.entries.filter((entry) => entry.type === "milestone").length,
      },
    } : {}),
  };
}
