import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import type { RepositoryRegistration } from "../src/projects/config/repository-registry.js";
import { GitHubClient } from "../src/projects/integration/github-client.js";
import { ProjectManifestLoader } from "../src/projects/integration/manifest-loader.js";
import { resolveRepositoryAsset } from "../src/projects/integration/github-urls.js";

const registration: RepositoryRegistration = { owner: "Titanium-Harmonics", repository: "BAD", ref: "main" };
const revision = "a".repeat(40);
const fixtures = resolve(import.meta.dirname, "fixtures/bad");

async function fixtureFetch(roadmapStatus = 200): Promise<typeof fetch> {
  const project = await readFile(resolve(fixtures, "project.yaml"), "utf8");
  const roadmap = await readFile(resolve(fixtures, "roadmap.yaml"), "utf8");
  return (async (input: string | URL | Request) => {
    const url = String(input);
    if (url.includes("api.github.com")) return Response.json({ sha: revision });
    if (url.endsWith("/.th/project.yaml")) return new Response(project);
    if (url.endsWith("/.th/roadmap.yaml")) return roadmapStatus === 404
      ? new Response("Not found", { status: 404, statusText: "Not Found" })
      : new Response(roadmap);
    return new Response("Not found", { status: 404 });
  }) as typeof fetch;
}

test("loads both manifests from one commit-pinned snapshot", async () => {
  const loader = new ProjectManifestLoader(new GitHubClient({ fetch: await fixtureFetch() }));
  const result = await loader.load(registration);
  assert.equal(result.success, true);
  if (!result.success) return;
  assert.equal(result.data.revision, revision);
  assert.equal(result.data.roadmap?.entries.length, 3);
  assert.equal(result.data.branding.banner?.revision, revision);
  assert.match(result.data.branding.banner?.rawUrl ?? "", new RegExp(`/${revision}/docs/assets/bad-banner.png$`));
});

test("accepts a missing optional roadmap", async () => {
  const loader = new ProjectManifestLoader(new GitHubClient({ fetch: await fixtureFetch(404) }));
  const result = await loader.load(registration);
  assert.equal(result.success, true);
  if (result.success) assert.equal(result.data.roadmap, undefined);
});

test("rejects unsafe repository asset paths", () => {
  assert.throws(() => resolveRepositoryAsset(registration, revision, "../secret.png"), /Invalid repository-relative path/);
  assert.throws(() => resolveRepositoryAsset(registration, revision, "/absolute.png"), /Invalid repository-relative path/);
});
