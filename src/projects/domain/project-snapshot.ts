import type { ProjectManifest } from "./project.js";
import type { RoadmapManifest } from "./roadmap.js";
import type { ValidationIssue } from "./validation.js";

export interface ResolvedRepositoryAsset {
  path: string;
  rawUrl: string;
  repositoryUrl: string;
  revision: string;
}

export interface ResolvedProjectBranding {
  banner?: ResolvedRepositoryAsset;
}

export interface ProjectSnapshot {
  project: ProjectManifest;
  roadmap?: RoadmapManifest;
  revision: string;
  branding: ResolvedProjectBranding;
  warnings: ValidationIssue[];
}

