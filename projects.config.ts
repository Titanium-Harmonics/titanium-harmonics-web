import type { RepositoryRegistration } from "./src/projects/config/repository-registry.js";

/**
 * Deliberately explicit: appearing in the Titanium Harmonics project catalog
 * requires a reviewed registration.
 */
export const PROJECT_REPOSITORIES = [
  {
    owner: "Titanium-Harmonics",
    repository: "BAD",
    ref: "main",
  },
  {
    owner: "Titanium-Harmonics",
    repository: "RIDE",
    ref: "development",
  },
] as const satisfies readonly RepositoryRegistration[];

