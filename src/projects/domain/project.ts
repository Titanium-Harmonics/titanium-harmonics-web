export const PROJECT_STATUSES = [
  "idea",
  "active",
  "paused",
  "completed",
  "archived",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export interface ProjectRepository {
  provider: "github";
  owner: string;
  name: string;
  url: string;
  defaultBranch: string;
}

export interface ProjectLinks {
  source?: string;
  [name: string]: string | undefined;
}

export interface ProjectBranding {
  banner?: string;
  [name: string]: string | undefined;
}

export interface Project {
  id: string;
  name: string;
  fullName?: string;
  summary: string;
  status: ProjectStatus;
  repository: ProjectRepository;
  platforms: string[];
  categories: string[];
  technologies: string[];
  links: ProjectLinks;
  branding: ProjectBranding;
}

export interface ProjectManifest {
  schemaVersion: 1;
  project: Project;
}

