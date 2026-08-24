import { PROJECT_REPOSITORIES } from "../../../projects.config.js";
import { loadRegistry } from "./load-registry.js";

const result = await loadRegistry(PROJECT_REPOSITORIES);

for (const project of result.projects) {
  const roadmap = project.roadmap ? `${project.roadmap.entries.length} roadmap entries` : "no roadmap";
  console.log(`[${project.project.project.id}] TH Schema v1 valid @ ${project.revision.slice(0, 12)} (${roadmap})`);
}
for (const diagnostic of result.diagnostics) {
  const output = `[${diagnostic.repository}] ${diagnostic.path}: ${diagnostic.message}`;
  if (diagnostic.severity === "warning") console.warn(`WARNING ${output}`);
  else console.error(`ERROR ${output}`);
}

if (!result.valid) {
  console.error("Registry validation failed after aggregating all project errors.");
  process.exitCode = 1;
} else {
  console.log(`Validated ${result.projects.length} registered project(s).`);
}

