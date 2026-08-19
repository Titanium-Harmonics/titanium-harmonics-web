import assert from "node:assert/strict";
import test from "node:test";
import type { ProjectSnapshot } from "../src/projects/domain/project-snapshot.js";
import { formatIdentifier, listProjectCards } from "../src/projects/queries/project-catalog.js";
import { renderProjectGrid } from "../src/projects/templates/project-card.js";
import { renderProjectsIndex } from "../src/projects/templates/projects-index.js";

const snapshot: ProjectSnapshot = {
  project: {
    schemaVersion: 1,
    project: {
      id: "bad",
      name: "B.A.D.",
      fullName: "Beat Accuracy Detector",
      summary: "Detect <beats> & report timing.",
      status: "active",
      repository: {
        provider: "github",
        owner: "Titanium-Harmonics",
        name: "BAD",
        url: "https://github.com/Titanium-Harmonics/BAD",
        defaultBranch: "main",
      },
      platforms: ["android"],
      categories: ["audio"],
      technologies: ["kotlin", "jetpack_compose", "dsp", "gradle"],
      links: { source: "https://github.com/Titanium-Harmonics/BAD" },
      branding: { banner: "docs/assets/bad-banner.png" },
    },
  },
  revision: "a".repeat(40),
  branding: {
    banner: {
      path: "docs/assets/bad-banner.png",
      revision: "a".repeat(40),
      rawUrl: "https://raw.githubusercontent.com/Titanium-Harmonics/BAD/sha/docs/assets/bad-banner.png",
      repositoryUrl: "https://github.com/Titanium-Harmonics/BAD/blob/sha/docs/assets/bad-banner.png",
    },
  },
  warnings: [],
};

test("formats stable identifiers for display", () => {
  assert.equal(formatIdentifier("jetpack_compose"), "Jetpack Compose");
  assert.equal(formatIdentifier("dsp"), "DSP");
});

test("creates bounded card metadata from a snapshot", () => {
  const [card] = listProjectCards([snapshot]);
  assert.ok(card);
  assert.deepEqual(card.technologies, ["Kotlin", "Jetpack Compose", "DSP"]);
  assert.equal(card.platform, "Android");
});

test("renders escaped accessible project cards", () => {
  const html = renderProjectGrid(listProjectCards([snapshot]));
  assert.match(html, /Detect &lt;beats&gt; &amp; report timing/);
  assert.match(html, /href="https:\/\/github.com\/Titanium-Harmonics\/BAD"/);
  assert.match(html, /target="_blank" rel="noreferrer"/);
  assert.match(html, /aria-label="Platform and technologies"/);
});

test("renders the standalone Projects index", () => {
  const html = renderProjectsIndex(listProjectCards([snapshot]));
  assert.match(html, /<title>Projects — Titanium Harmonics<\/title>/);
  assert.match(html, /aria-current="page"/);
});
