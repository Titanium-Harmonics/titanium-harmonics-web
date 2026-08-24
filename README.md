# titanium-harmonics-web
Official website for Titanium Harmonics — projects, build logs, experiments, and engineering adventures.

## Brand palette

The current site palette is derived from the Titanium Harmonics logo and should remain consistent unless intentionally changed:

- Graphite: `#171717`, `#252525`, `#454544`
- Metallic gray: `#74716e`, `#aaa7a6`, `#dddddd`
- Warm orange: `#f3a54c`
- Amber: `#ffb33e`
- Coral highlight: `#ff8358`
- Off-white: `#f7f5f2`

## Local verification

```shell
npm ci
npm run check
npm test
npm run build
```

The generated GitHub Pages site is written to `dist/`, including a `.nojekyll`
marker so nested static routes are served without Jekyll processing. Preview it
with:

```shell
python3 -m http.server 8000 --directory dist
```

## GitHub Pages deployment

The `Build and deploy GitHub Pages` workflow validates the manifest-backed
project catalog, generates the static site, and deploys `dist/`. In the GitHub
repository settings, select **GitHub Actions** as the Pages source once. Keep
the custom domain configured in Pages settings; `CNAME` is included in the
generated artifact.

Deployments run on pushes to `main` and project repository dispatches. See
[project-triggered website rebuilds](docs/project-rebuilds.md) for the
cross-repository setup.
