# Team I — Coordinates Widget & Clipboard

**Scope**

- Clicked coordinates accuracy
- Clipboard copy format validation

**Test Checklist**

- [ ] Does clicking a location on a map accurately show the clicked coordinates?
- [ ] Does clicking on the widget successfully copy the coordinates to the clipboard?
- [ ] Do the clipboard coordinates follow lat/lon format?

**Owned Paths**

- Specs: `tests/pages/coordinates/specs`
- POM: `tests/pages/coordinates/po`

**Dependencies**

- map

**TestID Prefix**

- `am-coordinates` (use only if roles/labels are insufficient)

**Definition of Done (DoD)**

- Covers required flows and states within scope
- No fixed sleeps; uses expectations or URL/request assertions
- Two consecutive green local runs with report/trace
- No edits outside your team folders
- Any new testids listed in PR description
