import type { RepositoryRegistration } from "../config/repository-registry.js";
import type { ResolvedRepositoryAsset } from "../domain/project-snapshot.js";

function encodePath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}

function assertRelativeRepositoryPath(path: string): void {
  const segments = path.split("/");
  if (
    path.length === 0
    || path.startsWith("/")
    || segments.some((segment) => segment === "" || segment === "." || segment === "..")
  ) {
    throw new Error(`Invalid repository-relative path: ${path}`);
  }
}

export function githubApiCommitUrl(registration: RepositoryRegistration): string {
  return `https://api.github.com/repos/${encodeURIComponent(registration.owner)}/${encodeURIComponent(registration.repository)}/commits/${encodeURIComponent(registration.ref)}`;
}

export function githubRawUrl(registration: RepositoryRegistration, revision: string, path: string): string {
  assertRelativeRepositoryPath(path);
  return `https://raw.githubusercontent.com/${encodeURIComponent(registration.owner)}/${encodeURIComponent(registration.repository)}/${encodeURIComponent(revision)}/${encodePath(path)}`;
}

export function resolveRepositoryAsset(
  registration: RepositoryRegistration,
  revision: string,
  path: string,
): ResolvedRepositoryAsset {
  assertRelativeRepositoryPath(path);
  return {
    path,
    revision,
    rawUrl: githubRawUrl(registration, revision, path),
    repositoryUrl: `https://github.com/${encodeURIComponent(registration.owner)}/${encodeURIComponent(registration.repository)}/blob/${encodeURIComponent(revision)}/${encodePath(path)}`,
  };
}

