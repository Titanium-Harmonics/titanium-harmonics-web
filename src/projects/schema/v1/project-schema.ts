import { z } from "zod";
import { PROJECT_STATUSES, type ProjectManifest } from "../../domain/project.js";
import type { ValidationResult } from "../../domain/validation.js";
import { PROJECT_ID_PATTERN, unknownFieldWarnings, zodIssues } from "../common.js";

const httpUrlSchema = z.url().refine(
  (value) => ["http:", "https:"].includes(new URL(value).protocol),
  "Must use an HTTP or HTTPS URL.",
);

const repositorySchema = z.object({
  provider: z.literal("github"),
  owner: z.string().trim().min(1),
  name: z.string().trim().min(1),
  url: httpUrlSchema,
  default_branch: z.string().trim().min(1),
}).passthrough();

const projectSchema = z.object({
  id: z.string().regex(PROJECT_ID_PATTERN, "Must be a lowercase, URL-safe stable ID."),
  name: z.string().trim().min(1),
  full_name: z.string().trim().min(1).optional(),
  summary: z.string().trim().min(1),
  status: z.enum(PROJECT_STATUSES),
  repository: repositorySchema,
  platforms: z.array(z.string().trim().min(1)).optional(),
  categories: z.array(z.string().trim().min(1)).optional(),
  technologies: z.array(z.string().trim().min(1)).optional(),
  links: z.record(z.string(), httpUrlSchema).optional(),
  branding: z.record(z.string(), z.string().trim().min(1)).optional(),
}).passthrough();

const manifestSchema = z.object({
  schema_version: z.literal(1),
  project: projectSchema,
}).passthrough();

export function validateProjectV1(input: unknown): ValidationResult<ProjectManifest> {
  const parsed = manifestSchema.safeParse(input);
  const root = input as Record<string, unknown> | null;
  const project = root?.project as Record<string, unknown> | null;
  const repository = project?.repository;
  const warnings = [
    ...unknownFieldWarnings(input, new Set(["schema_version", "project"]), "$"),
    ...unknownFieldWarnings(project, new Set([
      "id", "name", "full_name", "summary", "status", "repository", "platforms",
      "categories", "technologies", "links", "branding",
    ]), "project"),
    ...unknownFieldWarnings(repository, new Set([
      "provider", "owner", "name", "url", "default_branch",
    ]), "project.repository"),
  ];

  if (!parsed.success) {
    return { success: false, errors: zodIssues(parsed.error.issues), warnings };
  }

  const value = parsed.data;
  return {
    success: true,
    warnings,
    data: {
      schemaVersion: 1,
      project: {
        id: value.project.id,
        name: value.project.name,
        ...(value.project.full_name === undefined ? {} : { fullName: value.project.full_name }),
        summary: value.project.summary,
        status: value.project.status,
        repository: {
          provider: value.project.repository.provider,
          owner: value.project.repository.owner,
          name: value.project.repository.name,
          url: value.project.repository.url,
          defaultBranch: value.project.repository.default_branch,
        },
        platforms: value.project.platforms ?? [],
        categories: value.project.categories ?? [],
        technologies: value.project.technologies ?? [],
        links: value.project.links ?? {},
        branding: value.project.branding ?? {},
      },
    },
  };
}
