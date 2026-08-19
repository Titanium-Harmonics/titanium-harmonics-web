import type { $ZodIssue } from "zod/v4/core";
import type { ValidationIssue } from "../domain/validation.js";

export const PROJECT_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const WAYPOINT_ID_PATTERN = /^WP-[0-9]{3,}$/;
export const MILESTONE_ID_PATTERN = /^v(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)$/;

export function formatPath(path: PropertyKey[]): string {
  if (path.length === 0) return "$";
  return path.reduce<string>((result, segment) => {
    if (typeof segment === "number") return `${result}[${segment}]`;
    return result ? `${result}.${String(segment)}` : String(segment);
  }, "");
}

export function zodIssues(issues: $ZodIssue[]): ValidationIssue[] {
  return issues.map((issue) => ({
    severity: "error",
    path: formatPath(issue.path),
    message: issue.message,
  }));
}

export function unknownFieldWarnings(
  value: unknown,
  allowed: ReadonlySet<string>,
  path: string,
): ValidationIssue[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.keys(value)
    .filter((key) => !allowed.has(key))
    .map((key) => ({
      severity: "warning" as const,
      path: `${path}.${key}`,
      message: "Unknown TH Schema v1 field was accepted but is not used by the website.",
    }));
}
