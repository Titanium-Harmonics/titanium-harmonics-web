import { z } from "zod";
import {
  MILESTONE_STATUSES,
  WAYPOINT_STATUSES,
  type Milestone,
  type RoadmapEntry,
  type RoadmapManifest,
  type Waypoint,
  type WaypointId,
} from "../../domain/roadmap.js";
import type { ValidationIssue, ValidationResult } from "../../domain/validation.js";
import {
  MILESTONE_ID_PATTERN,
  PROJECT_ID_PATTERN,
  WAYPOINT_ID_PATTERN,
  unknownFieldWarnings,
  zodIssues,
} from "../common.js";

const waypointSchema = z.object({
  id: z.string().regex(WAYPOINT_ID_PATTERN, "Must use the immutable WP-001 format."),
  type: z.literal("waypoint"),
  title: z.string().trim().min(1),
  status: z.enum(WAYPOINT_STATUSES),
  description: z.string().trim().min(1),
  depends_on: z.array(z.string().regex(WAYPOINT_ID_PATTERN)).optional(),
}).passthrough();

const milestoneSchema = z.object({
  id: z.string().regex(MILESTONE_ID_PATTERN, "Must use strict vMAJOR.MINOR.PATCH format."),
  type: z.literal("milestone"),
  title: z.string().trim().min(1),
  status: z.enum(MILESTONE_STATUSES),
  description: z.string().trim().min(1),
  includes: z.array(z.string().regex(WAYPOINT_ID_PATTERN)).min(1),
}).passthrough();

const roadmapSchema = z.object({
  schema_version: z.literal(1),
  project: z.string().regex(PROJECT_ID_PATTERN),
  roadmap: z.array(z.discriminatedUnion("type", [waypointSchema, milestoneSchema])),
}).passthrough();

function semanticIssues(entries: RoadmapEntry[]): ValidationIssue[] {
  const errors: ValidationIssue[] = [];
  const ids = new Set<string>();
  const waypointIds = new Set(entries.filter((entry) => entry.type === "waypoint").map((entry) => entry.id));
  const membership = new Map<string, string>();

  entries.forEach((entry, index) => {
    if (ids.has(entry.id)) {
      errors.push({ severity: "error", path: `roadmap[${index}].id`, message: `Duplicate roadmap ID ${entry.id}.` });
    }
    ids.add(entry.id);

    if (entry.type === "waypoint") {
      for (const dependency of entry.dependsOn) {
        if (!waypointIds.has(dependency)) {
          errors.push({ severity: "error", path: `roadmap[${index}].depends_on`, message: `Unknown waypoint dependency ${dependency}.` });
        } else if (dependency === entry.id) {
          errors.push({ severity: "error", path: `roadmap[${index}].depends_on`, message: "A waypoint cannot depend on itself." });
        }
      }
    } else {
      const includedHere = new Set<string>();
      for (const waypointId of entry.includes) {
        if (!waypointIds.has(waypointId)) {
          errors.push({ severity: "error", path: `roadmap[${index}].includes`, message: `Unknown waypoint ${waypointId}.` });
        }
        if (includedHere.has(waypointId)) {
          errors.push({ severity: "error", path: `roadmap[${index}].includes`, message: `Waypoint ${waypointId} is included more than once.` });
        }
        includedHere.add(waypointId);
        const owner = membership.get(waypointId);
        if (owner && owner !== entry.id) {
          errors.push({ severity: "error", path: `roadmap[${index}].includes`, message: `Waypoint ${waypointId} already belongs to milestone ${owner}.` });
        } else {
          membership.set(waypointId, entry.id);
        }
      }
    }
  });

  const waypoints = new Map(entries.filter((entry): entry is Waypoint => entry.type === "waypoint").map((entry) => [entry.id, entry]));
  const visiting = new Set<string>();
  const visited = new Set<string>();
  function visit(id: WaypointId): void {
    if (visiting.has(id)) {
      errors.push({ severity: "error", path: "roadmap", message: `Dependency cycle detected at ${id}.` });
      return;
    }
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dependency of waypoints.get(id)?.dependsOn ?? []) visit(dependency);
    visiting.delete(id);
    visited.add(id);
  }
  for (const id of waypoints.keys()) visit(id);

  return errors;
}

export function validateRoadmapV1(input: unknown): ValidationResult<RoadmapManifest> {
  const parsed = roadmapSchema.safeParse(input);
  const root = input as Record<string, unknown> | null;
  const rawEntries = Array.isArray(root?.roadmap) ? root.roadmap : [];
  const warnings = [
    ...unknownFieldWarnings(input, new Set(["schema_version", "project", "roadmap"]), "$"),
    ...rawEntries.flatMap((entry, index) => {
      const type = (entry as { type?: unknown })?.type;
      const allowed = type === "milestone"
        ? new Set(["id", "type", "title", "status", "description", "includes"])
        : new Set(["id", "type", "title", "status", "description", "depends_on"]);
      return unknownFieldWarnings(entry, allowed, `roadmap[${index}]`);
    }),
  ];

  if (!parsed.success) {
    return { success: false, errors: zodIssues(parsed.error.issues), warnings };
  }

  const entries: RoadmapEntry[] = parsed.data.roadmap.map((entry) => entry.type === "waypoint"
    ? ({
        id: entry.id as Waypoint["id"],
        type: "waypoint",
        title: entry.title,
        status: entry.status,
        description: entry.description,
        dependsOn: (entry.depends_on ?? []) as Waypoint["dependsOn"],
      } satisfies Waypoint)
    : ({
        id: entry.id as Milestone["id"],
        type: "milestone",
        title: entry.title,
        status: entry.status,
        description: entry.description,
        includes: entry.includes as Milestone["includes"],
      } satisfies Milestone));
  const errors = semanticIssues(entries);
  if (errors.length > 0) return { success: false, errors, warnings };

  return { success: true, warnings, data: { schemaVersion: 1, projectId: parsed.data.project, entries } };
}
