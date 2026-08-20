# Project-triggered website rebuilds

The website listens for a `repository_dispatch` event named
`project-manifest-updated`. A project repository should send that event only
when a website-facing manifest or referenced asset changes.

Recommended project workflow paths:

```yaml
on:
  push:
    branches: [main]
    paths:
      - ".th/**"
      - "docs/assets/bad-banner.png"
```

The asset paths must match files referenced by `.th/project.yaml`; GitHub
Actions cannot derive `paths` filters dynamically from YAML.

The project repository needs an Actions secret named `WEBSITE_DISPATCH_TOKEN`.
Use a fine-grained personal access token or GitHub App token with permission to
send repository dispatch events to the website repository. A project
repository's default `GITHUB_TOKEN` is scoped to that project and should not be
used for this cross-repository call.

Example dispatch step:

```yaml
- name: Rebuild Titanium Harmonics website
  env:
    GH_TOKEN: ${{ secrets.WEBSITE_DISPATCH_TOKEN }}
  run: >-
    gh api
    --method POST
    repos/Titanium-Harmonics/titanium-harmonics-web/dispatches
    -f event_type=project-manifest-updated
    -f 'client_payload[repository]=${{ github.repository }}'
    -f 'client_payload[revision]=${{ github.sha }}'
```

The website validates and rebuilds its complete explicit registry after a
dispatch. Invalid registered manifests fail the new deployment while the last
successful GitHub Pages deployment remains live.
