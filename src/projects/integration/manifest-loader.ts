import type { RepositoryRegistration } from "../config/repository-registry.js";
import type { ProjectSnapshot } from "../domain/project-snapshot.js";
import type { ValidationIssue, ValidationResult } from "../domain/validation.js";
import { parseManifest, validateProjectRoadmapMatch } from "../schema/parse-manifest.js";
import { GitHubClient } from "./github-client.js";
import { resolveRepositoryAsset } from "./github-urls.js";

export class ProjectManifestLoader {
  constructor(private readonly github: GitHubClient) {}

  async load(registration: RepositoryRegistration): Promise<ValidationResult<ProjectSnapshot>> {
    let revision: string;
    let projectSource: string;
    let roadmapSource: string | undefined;
    try {
      revision = await this.github.resolveRevision(registration);
      [projectSource, roadmapSource] = await Promise.all([
        this.github.readText(registration, revision, ".th/project.yaml") as Promise<string>,
        this.github.readText(registration, revision, ".th/roadmap.yaml", { optional: true }),
      ]);
    } catch (error) {
      return failure("repository", error);
    }

    const project = parseManifest(projectSource, "project");
    if (!project.success) return project;

    const warnings = [...project.warnings];
    const roadmap = roadmapSource === undefined ? undefined : parseManifest(roadmapSource, "roadmap");
    if (roadmap && !roadmap.success) {
      return { success: false, errors: roadmap.errors, warnings: [...warnings, ...roadmap.warnings] };
    }
    if (roadmap) warnings.push(...roadmap.warnings);

    const matched = validateProjectRoadmapMatch(project.data, roadmap?.data);
    if (!matched.success) return { ...matched, warnings: [...warnings, ...matched.warnings] };

    const repository = project.data.project.repository;
    if (repository.owner !== registration.owner || repository.name !== registration.repository) {
      return {
        success: false,
        warnings,
        errors: [{
          severity: "error",
          path: "project.repository",
          message: `Manifest repository ${repository.owner}/${repository.name} does not match registry ${registration.owner}/${registration.repository}.`,
        }],
      };
    }

    let banner;
    try {
      const path = project.data.project.branding.banner;
      banner = path ? resolveRepositoryAsset(registration, revision, path) : undefined;
    } catch (error) {
      return failure("project.branding.banner", error, warnings);
    }

    return {
      success: true,
      warnings,
      data: {
        project: project.data,
        ...(roadmap?.data ? { roadmap: roadmap.data } : {}),
        revision,
        branding: banner ? { banner } : {},
        warnings,
      },
    };
  }
}

function failure(path: string, error: unknown, warnings: ValidationIssue[] = []): ValidationResult<never> {
  return {
    success: false,
    warnings,
    errors: [{ severity: "error", path, message: error instanceof Error ? error.message : String(error) }],
  };
}

