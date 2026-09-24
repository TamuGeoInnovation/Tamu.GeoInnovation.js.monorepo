# Team H — Layers & Legend Support

**Scope**

- Layer list correctness (visible/hidden/loading/error)
- Legend sync with layers & zoom
- Lightweight network/request assertions to support other teams

**Owned Paths**

- Specs: `tests/pages/layers/specs`
- POM: `tests/pages/layers/po`

**Dependencies**

- map

**TestID Prefix**

- `am-layers` (use only if roles/labels are insufficient)

**Definition of Done (DoD)**

- Covers required flows and states within scope
- No fixed sleeps; uses expectations or URL/request assertions
- Two consecutive green local runs with report/trace
- No edits outside your team folders
- Any new testids listed in PR description
