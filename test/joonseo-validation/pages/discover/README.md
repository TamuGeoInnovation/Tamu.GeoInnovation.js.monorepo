# Team F — Discover

**Scope**

- Search truthy/loading/falsy
- Badge rendering
- Keyboard navigation
- Click-through navigation

**Test Checklist**

**Search**

- [ ] Does the event map search work?
- [ ] Are there truthy/loading/falsy states?
- [ ] Does it display the correct badges ("Event", "Experimental", "Deprecated", etc.) from source data?
- [ ] Does keyboard navigation work in the results?

**Upcoming Events**

- [ ] Are there truthy/falsy (events = 0 | events > 0) states?
- [ ] Are events ordered correctly (by date)?

**Experimental Applications**

- [ ] Does the list render?

**Global Navigation**

- [ ] Does clicking on a search map result or card yield successful navigation?

**Owned Paths**

- Specs: `tests/pages/discover/specs`
- POM: `tests/pages/discover/po`

**Dependencies**

- app-shell

**TestID Prefix**

- `am-discover` (use only if roles/labels are insufficient)

**Definition of Done (DoD)**

- Covers required flows and states within scope
- No fixed sleeps; uses expectations or URL/request assertions
- Two consecutive green local runs with report/trace
- No edits outside your team folders
- Any new testids listed in PR description
