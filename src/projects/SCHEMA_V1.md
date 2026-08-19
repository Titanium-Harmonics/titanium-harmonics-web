# TH Schema v1 website contract

The project repository is the source of truth. `.th/project.yaml` is required;
`.th/roadmap.yaml` is optional.

- Project statuses: `idea`, `active`, `paused`, `completed`, `archived`.
- Project IDs are lowercase URL-safe slugs and are immutable once published.
- Waypoint IDs use `WP-001` form and are immutable. Cancelled IDs are retained.
- Roadmap list order is presentation order. `depends_on` never controls ordering.
- A waypoint belongs to zero or one milestone.
- Milestones own membership through a non-empty `includes` list.
- Milestone IDs use strict `vMAJOR.MINOR.PATCH` form.
- Unknown Schema v1 fields produce warnings and are otherwise tolerated.
- Unsupported schema versions and invalid registered projects are errors.

Immutability is a publishing/version-history rule. The Phase 1 validator enforces
ID syntax; comparison with previously published manifests belongs in the future
registry/build integration.

