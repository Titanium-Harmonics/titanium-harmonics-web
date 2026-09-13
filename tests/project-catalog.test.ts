import assert from "node:assert/strict";
import test from "node:test";
import type { ProjectSnapshot } from "../src/projects/domain/project-snapshot.js";
import { formatIdentifier, listProjectCards } from "../src/projects/queries/project-catalog.js";
import { getProjectDetail, groupTimelineEntries } from "../src/projects/queries/project-detail.js";
import { renderProjectGrid } from "../src/projects/templates/project-card.js";
import { renderProjectDetail } from "../src/projects/templates/project-detail.js";
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

snapshot.roadmap = {
  schemaVersion: 1,
  projectId: "bad",
  entries: [
    { id: "WP-001", type: "waypoint", title: "Foundation", status: "completed", description: "Build it.", dependsOn: [] },
    { id: "v1.0.0", type: "milestone", title: "First release", status: "planned", description: "Ship it.", includes: ["WP-001"] },
  ],
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
  assert.match(html, /href="\/projects\/bad\/"/);
  assert.doesNotMatch(html, /target="_blank"/);
  assert.match(html, /aria-label="Platform and technologies"/);
  assert.match(html, /class="project-card-link"/);
});

test("adds an incoming-project placeholder only when requested", () => {
  const cards = listProjectCards([snapshot]);
  const homepage = renderProjectGrid(cards, { showIncomingPlaceholder: true });
  const catalog = renderProjectGrid(cards);
  assert.ok(homepage.indexOf("B.A.D.") < homepage.indexOf("More projects incoming shortly."));
  assert.match(homepage, /project-card-placeholder/);
  assert.match(homepage, /src="\/assets\/c_soon\.png"/);
  assert.match(homepage, /Coming Soon/);
  assert.doesNotMatch(catalog, /More projects incoming shortly/);
});

test("renders the standalone Projects index", () => {
  const html = renderProjectsIndex(listProjectCards([snapshot]));
  assert.match(html, /<title>Projects — Titanium Harmonics<\/title>/);
  assert.match(html, /aria-current="page"/);
  assert.match(html, /class="projects-statement">Explore the things we build\./);
  assert.match(html, /From early prototypes and failures/);
  assert.match(html, /href="\/#contact">Contact<\/a>/);
  assert.doesNotMatch(html, /#about/);
  assert.match(html, /aria-label="Back to top"/);
});

test("builds and renders a project detail page", () => {
  const detail = getProjectDetail(snapshot);
  assert.equal(detail.roadmap?.completed, 1);
  assert.equal(detail.roadmap?.milestones, 1);
  assert.deepEqual(detail.roadmap?.groups.map(({ milestone }) => milestone.id), ["v1.0.0"]);
  const html = renderProjectDetail(detail);
  assert.match(html, /<title>B\.A\.D\. — Titanium Harmonics<\/title>/);
  assert.match(html, /id="wp-001"/);
  assert.match(html, /MILESTONE v1\.0\.0/);
  assert.match(html, /1 of 1<\/b> waypoints completed/);
  assert.match(html, /<details class="roadmap-milestone-group/);
  assert.match(html, /View on GitHub/);
  assert.match(html, /href="\/#contact">Contact<\/a>/);
  assert.doesNotMatch(html, /#about/);
  assert.match(html, /aria-label="Back to top"/);
  assert.match(html, /introObserver\.observe\(pageIntro\)/);
  assert.doesNotMatch(html, /PROJECT OVERVIEW/);
  assert.doesNotMatch(html, /Built with purpose/);
  assert.ok(html.indexOf("project-hero-facts") > html.indexOf("View on GitHub"));
});

test("groups waypoints under milestones ordered by their last included waypoint", () => {
  const grouped = groupTimelineEntries([
    { id: "WP-001", type: "waypoint", title: "One", status: "completed", description: "One", dependsOn: [] },
    { id: "WP-002", type: "waypoint", title: "Two", status: "completed", description: "Two", dependsOn: ["WP-001"] },
    { id: "WP-003", type: "waypoint", title: "Three", status: "planned", description: "Three", dependsOn: ["WP-002"] },
    { id: "WP-004", type: "waypoint", title: "Four", status: "planned", description: "Four", dependsOn: ["WP-003"] },
    { id: "v2.0.0", type: "milestone", title: "Second", status: "planned", description: "Second", includes: ["WP-003", "WP-004"] },
    { id: "v1.0.0", type: "milestone", title: "First", status: "released", description: "First", includes: ["WP-001", "WP-002"] },
  ]);
  assert.deepEqual(grouped.groups.map(({ milestone }) => milestone.id), ["v1.0.0", "v2.0.0"]);
  assert.deepEqual(grouped.groups[0]?.waypoints.map(({ id }) => id), ["WP-001", "WP-002"]);
  assert.deepEqual(grouped.groups[1]?.waypoints.map(({ id }) => id), ["WP-003", "WP-004"]);
  assert.deepEqual(grouped.unassigned, []);
});
