# Team D — Sidebar.Directions

**Scope**

- Start/End via search & map click
- Travel modes & options pane
- Routing servers
- Leave now/Leave at
- Errors, Reset, Share deep-links

**Test Checklist**

**Endpoint Entry**

- [ ] Can users enter a start and end point by searching? Test truthy and falsy values
- [ ] Can users enter a location by clicking on the map?
- [ ] Do all entry methods correctly fill in the endpoint name?

**Travel Modes & Options**

- [ ] Does the travel mode selection work?
- [ ] Certain travel modes have additional options:
  - [ ] Can the options sub-section be accessed?
  - [ ] Are the settings applied? (Test visually or programmatically by inspecting routing requests)

**Routing Configuration**

- [ ] Does the routing server selection work?
- [ ] Does "leave now/leave at" work?

**Route Results**

- [ ] Are directions printed on successful route resolution?
- [ ] Are there appropriate error messages when a route cannot be resolved?
- [ ] Do loading states work?
- [ ] Do routing instructions accurately represent travel modes?
- [ ] For multi-modal routes, are they accurately segmented with their correct color indicator?
- [ ] Is the route drawn on the map?
- [ ] Does changing to a travel mode update the directions/drawn route?
- [ ] Does the route summary accurately show travel time/distance?

**Actions**

- [ ] Does the route reset button work (clear endpoints, clear directions, clear map route)?
- [ ] Does the share button correctly copy the hard-linked URL to clipboard?
- [ ] Directions can be initiated from URL parameters - does this functionality correctly work (share button)? (See: https://aggiemap.tamu.edu/changelog)

**Feedback Form**

- [ ] Does the feedback form load and correctly POST?
- [ ] Are there success/loading/falsy feedback states?

**Owned Paths**

- Specs: `tests/pages/sidebar/directions/specs`
- POM: `tests/pages/sidebar/directions/po`

**Dependencies**

- app-shell, map, layers

**TestID Prefix**

- `am-directions` (use only if roles/labels are insufficient)

**Definition of Done (DoD)**

- Covers required flows and states within scope
- No fixed sleeps; uses expectations or URL/request assertions
- Two consecutive green local runs with report/trace
- No edits outside your team folders
- Any new testids listed in PR description
