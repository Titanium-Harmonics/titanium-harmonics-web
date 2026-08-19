import type { RepositoryRegistration } from "../config/repository-registry.js";
import { repositoryLabel } from "../config/repository-registry.js";
import type { ProjectSnapshot } from "../domain/project-snapshot.js";
import type { ValidationIssue } from "../domain/validation.js";
import { GitHubClient } from "../integration/github-client.js";
import { ProjectManifestLoader } from "../integration/manifest-loader.js";

export interface RegistryDiagnostic extends ValidationIssue {
  repository: string;
}

export interface RegistryLoadResult {
  projects: ProjectSnapshot[];
  diagnostics: RegistryDiagnostic[];
  valid: boolean;
}

export async function loadRegistry(
  registrations: readonly RepositoryRegistration[],
  github = new GitHubClient(process.env.GITHUB_TOKEN ? { token: process.env.GITHUB_TOKEN } : {}),
): Promise<RegistryLoadResult> {
  const loader = new ProjectManifestLoader(github);
  const results = await Promise.all(registrations.map(async (registration) => ({
    registration,
    result: await loader.load(registration),
  })));
  const projects: ProjectSnapshot[] = [];
  const diagnostics: RegistryDiagnostic[] = [];

  for (const { registration, result } of results) {
    const repository = repositoryLabel(registration);
    diagnostics.push(...result.warnings.map((warning) => ({ ...warning, repository })));
    if (result.success) projects.push(result.data);
    else diagnostics.push(...result.errors.map((error) => ({ ...error, repository })));
  }

  return {
    projects,
    diagnostics,
    valid: diagnostics.every(({ severity }) => severity !== "error"),
  };
}
