import { parse } from "yaml";
import type { ProjectManifest } from "../domain/project.js";
import type { RoadmapManifest } from "../domain/roadmap.js";
import type { ValidationResult } from "../domain/validation.js";
import { validateProjectV1 } from "./v1/project-schema.js";
import { validateRoadmapV1 } from "./v1/roadmap-schema.js";

type ManifestKind = "project" | "roadmap";
type ManifestFor<K extends ManifestKind> = K extends "project" ? ProjectManifest : RoadmapManifest;

export function parseManifest<K extends ManifestKind>(source: string, kind: K): ValidationResult<ManifestFor<K>> {
  let input: unknown;
  try {
    input = parse(source);
  } catch (error) {
    return {
      success: false,
      warnings: [],
      errors: [{ severity: "error", path: "$", message: `Invalid YAML: ${error instanceof Error ? error.message : String(error)}` }],
    };
  }

  const version = input && typeof input === "object" ? (input as { schema_version?: unknown }).schema_version : undefined;
  if (version !== 1) {
    return {
      success: false,
      warnings: [],
      errors: [{ severity: "error", path: "schema_version", message: `Unsupported TH Schema version: ${String(version)}.` }],
    };
  }

  return (kind === "project" ? validateProjectV1(input) : validateRoadmapV1(input)) as ValidationResult<ManifestFor<K>>;
}

export function validateProjectRoadmapMatch(project: ProjectManifest, roadmap?: RoadmapManifest): ValidationResult<{ project: ProjectManifest; roadmap?: RoadmapManifest }> {
  if (roadmap && roadmap.projectId !== project.project.id) {
    return {
      success: false,
      warnings: [],
      errors: [{ severity: "error", path: "roadmap.project", message: `Expected ${project.project.id}, received ${roadmap.projectId}.` }],
    };
  }
  return { success: true, warnings: [], data: roadmap ? { project, roadmap } : { project } };
}

