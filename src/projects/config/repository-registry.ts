export interface RepositoryRegistration {
  owner: string;
  repository: string;
  /** Branch, tag, or commit to resolve. The loaded snapshot is always pinned to a SHA. */
  ref: string;
}

export function repositoryLabel(registration: RepositoryRegistration): string {
  return `${registration.owner}/${registration.repository}`;
}

