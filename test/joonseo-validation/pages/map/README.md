# Team B — Map Canvas & Interactions

**Scope**

- Map canvas presence
- Click / zoom interactions
- Feature popup open/close lifecycle

**Test Checklist**

- [ ] Does clicking on map features summon popup?
- [ ] Can popup be dismissed through clicking on the x?
- [ ] Can popup be dismissed with ESC key?

**Owned Paths**

- Specs: `tests/pages/map/specs`
- POM: `tests/pages/map/po`

**Dependencies**

- app-shell

**TestID Prefix**

- `am-map` (use only if roles/labels are insufficient)

**Definition of Done (DoD)**

- Covers required flows and states within scope
- No fixed sleeps; uses expectations or URL/request assertions
- Two consecutive green local runs with report/trace
- No edits outside your team folders
- Any new testids listed in PR description
