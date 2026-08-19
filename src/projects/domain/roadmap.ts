export const WAYPOINT_STATUSES = [
  "idea",
  "planned",
  "in_progress",
  "blocked",
  "completed",
  "cancelled",
] as const;

export const MILESTONE_STATUSES = ["planned", "released", "deprecated"] as const;

export type WaypointStatus = (typeof WAYPOINT_STATUSES)[number];
export type MilestoneStatus = (typeof MILESTONE_STATUSES)[number];
export type WaypointId = `WP-${string}`;
export type MilestoneId = `v${number}.${number}.${number}`;

export interface Waypoint {
  id: WaypointId;
  type: "waypoint";
  title: string;
  status: WaypointStatus;
  description: string;
  dependsOn: WaypointId[];
}

export interface Milestone {
  id: MilestoneId;
  type: "milestone";
  title: string;
  status: MilestoneStatus;
  description: string;
  includes: WaypointId[];
}

export type RoadmapEntry = Waypoint | Milestone;

export interface RoadmapManifest {
  schemaVersion: 1;
  projectId: string;
  /** Source list order is the official presentation order. */
  entries: RoadmapEntry[];
}

