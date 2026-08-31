# Team C — Sidebar.Main

**Scope**

- Tab switch to Main
- Building search UX & keyboarding
- Layer List states (visible, extent-hidden, loading, error)
- Legend updates
- Feature popup field assertions

**Test Checklist**

**Building Search**

- [ ] Test truthy search term (e.g. msc) - can it search building numbers, abbreviations, or name?
- [ ] Test falsy search term (gibberish) - is there an appropriate message?
- [ ] Does the loading state show when searching is ongoing?
- [ ] Can users navigate to results with arrow keys and select with enter key?
- [ ] Can users exit the results navigation context with keyboard action?

**Layer List**

- [ ] Does it show actively loaded and visible layers?
- [ ] Does it show actively loaded and non-visible layers (as a result of extent limiting)?
- [ ] Does it show loading state for loading layers?
- [ ] Does it show failed loading state for layers?
- [ ] Does toggling a layer appropriately render it on the map?

**Legend**

- [ ] Does it show an empty state message?
- [ ] Does it update when layers are toggled?
- [ ] Does it update based on layer extent visibility rules? (Some layers hide/show depending on zoom level)

**Feature Popup**

- [ ] Different feature layers have different content - test buildings vs. POI's
- [ ] Test any interactive elements such as the URL copy functionality
- [ ] Test dining locations layer popup:
  - [ ] Has an hours of operation collapsible section that shows a time table
  - [ ] Hours section can appropriately expand/collapse
  - [ ] Do the hours make sense (wrap-around to next day)?
- [ ] Directions to here:
  - [ ] Does it trigger a route change to directions feature?
  - [ ] Does it prefill the location name correctly?

**Owned Paths**

- Specs: `tests/pages/sidebar/main/specs`
- POM: `tests/pages/sidebar/main/po`

**Dependencies**

- app-shell, map, layers

**TestID Prefix**

- `am-sidebar-main` (use only if roles/labels are insufficient)

**Definition of Done (DoD)**

- Covers required flows and states within scope
- No fixed sleeps; uses expectations or URL/request assertions
- Two consecutive green local runs with report/trace
- No edits outside your team folders
- Any new testids listed in PR description
