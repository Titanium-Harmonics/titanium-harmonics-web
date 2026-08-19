import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { resolve } from "node:path";
import { parseManifest, validateProjectRoadmapMatch } from "../src/projects/schema/parse-manifest.js";

const fixtures = resolve(import.meta.dirname, "fixtures/bad");

test("parses and normalizes the B.A.D. project fixture", async () => {
  const result = parseManifest(await readFile(resolve(fixtures, "project.yaml"), "utf8"), "project");
  assert.equal(result.success, true);
  if (!result.success) return;
  assert.equal(result.data.project.id, "bad");
  assert.equal(result.data.project.repository.defaultBranch, "main");
  assert.deepEqual(result.data.project.technologies, ["kotlin", "jetpack_compose", "android", "gradle"]);
});

test("preserves official roadmap presentation order", async () => {
  const result = parseManifest(await readFile(resolve(fixtures, "roadmap.yaml"), "utf8"), "roadmap");
  assert.equal(result.success, true);
  if (!result.success) return;
  assert.deepEqual(result.data.entries.map(({ id }) => id), ["WP-001", "WP-002", "v1.0.0"]);
});

test("accepts optional project metadata and a missing roadmap", () => {
  const project = parseManifest(`
schema_version: 1
project:
  id: minimal
  name: Minimal
  summary: A valid minimal project.
  status: idea
  repository:
    provider: github
    owner: Titanium-Harmonics
    name: minimal
    url: https://github.com/Titanium-Harmonics/minimal
    default_branch: main
`, "project");
  assert.equal(project.success, true);
  if (!project.success) return;
  assert.deepEqual(project.data.project.platforms, []);
  assert.equal(validateProjectRoadmapMatch(project.data).success, true);
});

test("accepts unknown v1 fields with warnings", () => {
  const result = parseManifest(`
schema_version: 1
future_root: true
project:
  id: future
  name: Future
  summary: Forward-compatible project.
  status: active
  future_project_field: value
  repository:
    provider: github
    owner: Titanium-Harmonics
    name: future
    url: https://github.com/Titanium-Harmonics/future
    default_branch: main
`, "project");
  assert.equal(result.success, true);
  assert.deepEqual(result.warnings.map(({ path }) => path), ["$.future_root", "project.future_project_field"]);
});

test("rejects unsupported versions and invalid statuses", () => {
  const unsupported = parseManifest("schema_version: 2\nproject: {}", "project");
  assert.equal(unsupported.success, false);
  const invalid = parseManifest(`
schema_version: 1
project:
  id: bad-status
  name: Bad Status
  summary: Invalid status.
  status: experimental
  repository:
    provider: github
    owner: Titanium-Harmonics
    name: bad-status
    url: https://github.com/Titanium-Harmonics/bad-status
    default_branch: main
`, "project");
  assert.equal(invalid.success, false);
});

test("rejects invalid roadmap references, cycles, and multiple milestone membership", () => {
  const result = parseManifest(`
schema_version: 1
project: bad
roadmap:
  - { id: WP-001, type: waypoint, title: One, status: planned, description: One, depends_on: [WP-002] }
  - { id: WP-002, type: waypoint, title: Two, status: planned, description: Two, depends_on: [WP-001] }
  - { id: v1.0.0, type: milestone, title: One, status: planned, description: One, includes: [WP-001] }
  - { id: v2.0.0, type: milestone, title: Two, status: planned, description: Two, includes: [WP-001] }
`, "roadmap");
  assert.equal(result.success, false);
  if (result.success) return;
  assert.ok(result.errors.some(({ message }) => message.includes("cycle")));
  assert.ok(result.errors.some(({ message }) => message.includes("already belongs")));
});

test("requires strict milestone IDs and at least one included waypoint", () => {
  const result = parseManifest(`
schema_version: 1
project: bad
roadmap:
  - { id: v1.0, type: milestone, title: Empty, status: planned, description: Empty, includes: [] }
`, "roadmap");
  assert.equal(result.success, false);
});

test("checks cross-file project identity", async () => {
  const project = parseManifest(await readFile(resolve(fixtures, "project.yaml"), "utf8"), "project");
  const roadmap = parseManifest("schema_version: 1\nproject: another\nroadmap: []", "roadmap");
  assert.equal(project.success, true);
  assert.equal(roadmap.success, true);
  if (project.success && roadmap.success) {
    assert.equal(validateProjectRoadmapMatch(project.data, roadmap.data).success, false);
  }
});
