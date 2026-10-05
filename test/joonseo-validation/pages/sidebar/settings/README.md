# Team E — Sidebar.Settings

**Scope**

- Basemap selection
- State reflection on map
- Non-experimental settings

**Test Checklist**

- [ ] Does basemap selection work?
- [ ] Does it accurately represent the loaded basemap?

**Owned Paths**

- Specs: `tests/pages/sidebar/settings/specs`
- POM: `tests/pages/sidebar/settings/po`

**Dependencies**

- app-shell, map

**TestID Prefix**

- `am-settings` (use only if roles/labels are insufficient)

**Definition of Done (DoD)**

- Covers required flows and states within scope
- No fixed sleeps; uses expectations or URL/request assertions
- Two consecutive green local runs with report/trace
- No edits outside your team folders
- Any new testids listed in PR description
