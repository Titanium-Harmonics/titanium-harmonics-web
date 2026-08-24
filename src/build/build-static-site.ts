import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { PROJECT_REPOSITORIES } from "../../projects.config.js";
import { loadRegistry } from "../projects/build/load-registry.js";
import { listProjectCards } from "../projects/queries/project-catalog.js";
import { getProjectDetail } from "../projects/queries/project-detail.js";
import { renderProjectGrid } from "../projects/templates/project-card.js";
import { renderProjectDetail } from "../projects/templates/project-detail.js";
import { renderProjectsIndex } from "../projects/templates/projects-index.js";

const root = resolve(import.meta.dirname, "../..");
const output = resolve(root, "dist");

const registry = await loadRegistry(PROJECT_REPOSITORIES);
for (const diagnostic of registry.diagnostics) {
  const message = `[${diagnostic.repository}] ${diagnostic.path}: ${diagnostic.message}`;
  if (diagnostic.severity === "warning") console.warn(`WARNING ${message}`);
  else console.error(`ERROR ${message}`);
}
if (!registry.valid) throw new Error("Cannot build Projects pages: registry validation failed.");

const cards = listProjectCards(registry.projects);
const homepageSource = await readFile(resolve(root, "index.html"), "utf8");
const homepage = homepageSource.replace(
  /<!-- PROJECTS:START -->[\s\S]*?<!-- PROJECTS:END -->/,
  `<!-- PROJECTS:START -->\n${renderProjectGrid(cards, { showIncomingPlaceholder: true })}\n      <!-- PROJECTS:END -->`,
);
if (homepage === homepageSource) throw new Error("Homepage Projects generation markers are missing.");

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
const detailPages = registry.projects.map(async (snapshot) => {
  const detail = getProjectDetail(snapshot);
  const directory = resolve(output, "projects", detail.id);
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, "index.html"), renderProjectDetail(detail));
});
await Promise.all([
  writeFile(resolve(output, "index.html"), homepage),
  writeFile(resolve(output, ".nojekyll"), ""),
  cp(resolve(root, "styles.css"), resolve(output, "styles.css")),
  cp(resolve(root, "projects.css"), resolve(output, "projects.css")),
  cp(resolve(root, "CNAME"), resolve(output, "CNAME")),
  cp(resolve(root, "assets"), resolve(output, "assets"), { recursive: true }),
  mkdir(resolve(output, "projects"), { recursive: true }).then(() =>
    writeFile(resolve(output, "projects/index.html"), renderProjectsIndex(cards))),
  ...detailPages,
]);

console.log(`Built the static site with ${cards.length} project(s) into dist/.`);
