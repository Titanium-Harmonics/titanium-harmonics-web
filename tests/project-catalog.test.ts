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
  assert.match(html, /aria-label="Explore B\.A\.D\."/);
  assert.doesNotMatch(html, />Explore project<\/a>/);
});

test("adds an incoming-project placeholder only when requested", () => {
  const cards = listProjectCards([snapshot]);
  const homepage = renderProjectGrid(cards, { showIncomingPlaceholder: true });
  const catalog = renderProjectGrid(cards);
  assert.ok(homepage.indexOf("B.A.D.") < homepage.indexOf("More projects are taking shape."));
  assert.match(homepage, /project-card-placeholder/);
  assert.match(homepage, /src="\/assets\/c_soon\.png"/);
  assert.match(homepage, /Coming Soon/);
  assert.doesNotMatch(catalog, /More projects are taking shape/);
});

test("renders the standalone Projects index", () => {
  const html = renderProjectsIndex(listProjectCards([snapshot]));
  assert.match(html, /<title>Projects — Titanium Harmonics<\/title>/);
  assert.match(html, /aria-label="Main navigation">\s*<a href="\/">Home<\/a>/);
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
  assert.match(html, /aria-label="Main navigation">\s*<a href="\/">Home<\/a>/);
  assert.match(html, /aria-label="Breadcrumb">\s*<ol>\s*<li><a href="\/">Home<\/a><\/li>/);
  assert.match(html, /<nav class="detail-breadcrumb" aria-label="Breadcrumb">/);
  assert.match(html, /<a href="\/projects\/">All projects<\/a>/);
  assert.match(html, /<span aria-current="page">B\.A\.D\.<\/span>/);
  assert.doesNotMatch(html, /← All projects/);
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
});

test("renders an in-progress milestone with waypoint-based completion", () => {
  const detail = getProjectDetail({
    ...snapshot,
    roadmap: {
      schemaVersion: 1,
      projectId: "bad",
      entries: [
        { id: "WP-001", type: "waypoint", title: "Done", status: "completed", description: "Done", dependsOn: [] },
        { id: "WP-002", type: "waypoint", title: "Next", status: "planned", description: "Next", dependsOn: [] },
        { id: "v1.0.0", type: "milestone", title: "Release", status: "in_progress", description: "Release", includes: ["WP-001", "WP-002"] },
      ],
    },
  });
  assert.equal(detail.roadmap?.groups[0]?.milestone.displayStatus, "In progress");
  assert.equal(detail.roadmap?.completed, 1);
  assert.equal(detail.roadmap?.active, 0);
  const html = renderProjectDetail(detail);
  assert.match(html, /<details class="roadmap-milestone-group roadmap-status-in_progress"/);
  assert.match(html, /class="roadmap-status">In progress<\/span>/);
  assert.match(html, /--milestone-progress: 50%/);
  assert.match(html, /1 of 2<\/b> waypoints completed/);
});

test("renders grouped in-progress waypoints and hides unassigned ones", () => {
  const detail = getProjectDetail({
    ...snapshot,
    roadmap: {
      schemaVersion: 1,
      projectId: "bad",
      entries: [
        { id: "WP-001", type: "waypoint", title: "Grouped", status: "in_progress", description: "Grouped", dependsOn: [] },
        { id: "WP-002", type: "waypoint", title: "Unassigned", status: "in_progress", description: "Unassigned", dependsOn: [] },
        { id: "v1.0.0", type: "milestone", title: "Release", status: "planned", description: "Release", includes: ["WP-001"] },
      ],
    },
  });
  assert.equal(detail.roadmap?.groups[0]?.waypoints[0]?.displayStatus, "In progress");
  assert.equal(detail.roadmap?.active, 1);
  assert.equal(detail.roadmap?.completed, 0);
  assert.equal(detail.roadmap?.groups[0]?.milestone.completedIncludes, 0);
  const html = renderProjectDetail(detail);
  assert.doesNotMatch(html, /id="wp-002"|Unversioned waypoints/);
  assert.equal((html.match(/class="roadmap-status">In progress<\/span>/g) ?? []).length, 1);
  assert.equal((html.match(/class="roadmap-entry roadmap-waypoint roadmap-status-in_progress"/g) ?? []).length, 1);
});

test("hides empty milestones and excludes hidden waypoints from summary counts", () => {
  const detail = getProjectDetail({
    ...snapshot,
    roadmap: {
      schemaVersion: 1,
      projectId: "bad",
      entries: [
        { id: "WP-001", type: "waypoint", title: "Visible", status: "completed", description: "Visible", dependsOn: [] },
        { id: "WP-002", type: "waypoint", title: "Hidden completed", status: "completed", description: "Hidden", dependsOn: [] },
        { id: "WP-003", type: "waypoint", title: "Hidden planned", status: "planned", description: "Hidden", dependsOn: [] },
        { id: "v1.0.0", type: "milestone", title: "Visible release", status: "released", description: "Visible", includes: ["WP-001"] },
        { id: "v2.0.0", type: "milestone", title: "Empty release", status: "planned", description: "Empty", includes: [] },
      ],
    },
  });
  assert.deepEqual(detail.roadmap?.groups.map(({ milestone }) => milestone.id), ["v1.0.0"]);
  assert.equal(detail.roadmap?.milestones, 1);
  assert.equal(detail.roadmap?.completed, 1);
  assert.equal(detail.roadmap?.planned, 0);
  const html = renderProjectDetail(detail);
  assert.doesNotMatch(html, /Empty release|Hidden completed|Hidden planned|Unversioned waypoints/);
});
