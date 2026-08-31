# Team A — App Shell & Navigation

**Scope**

- App load & smoke
- Global routing / route assertions
- Sidebar show/hide
- 2D/3D toggle basic behavior

**Test Checklist**

- [ ] Can the sidebar be visible state be toggled?
- [ ] Does switching tabs update the page route?
- [ ] Does the 2D/3D toggle work between both modes?
- [ ] Does switching between modes preserve visible extent?

**Owned Paths**

- Specs: `tests/pages/app-shell/specs`
- POM: `tests/pages/app-shell/po`

**Dependencies**

- None

**TestID Prefix**

- `am-app` (use only if roles/labels are insufficient)

**Definition of Done (DoD)**

- Covers required flows and states within scope
- No fixed sleeps; uses expectations or URL/request assertions
- Two consecutive green local runs with report/trace
- No edits outside your team folders
- Any new testids listed in PR description
