# Team N — Responsiveness Matrix

**Scope**

- Device coverage (desktop/tablet/mobile) for smoke + key flows
- Reuses other teams' POMs; no new POMs

**Owned Paths**

- Specs: `tests/pages/responsive/specs`
- POM: `tests/pages/(reuses others' POMs)`

**Dependencies**

- app-shell, sidebar.main, sidebar.directions

**TestID Prefix**

- `am-responsive` (use only if roles/labels are insufficient)

**Definition of Done (DoD)**

- Covers required flows and states within scope
- No fixed sleeps; uses expectations or URL/request assertions
- Two consecutive green local runs with report/trace
- No edits outside your team folders
- Any new testids listed in PR description
