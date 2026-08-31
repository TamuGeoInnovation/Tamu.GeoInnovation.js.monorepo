# Team G — Events

**Scope**

- Slug loads event & intro redirect
- Accommodations builder (multi-step)
- LocalStorage persistence
- Event map handoff

**Test Checklist**

**Event Loading**

- [ ] Events are loaded from URL (e.g. https://dev.aggiemap.tamu.edu/events/gameday-parking)
- [ ] Does it load the correct event?
- [ ] Does it redirect to the intro route?

**Event Flow**

- [ ] Intro:
  - [ ] Does it show correct event details/dates?
  - [ ] Does the button redirect to accommodations?
- [ ] Accommodations (an event can have `n` accommodations):
  - [ ] Does this route correctly go through all available accommodations?
  - [ ] Does the last accommodation finally direct to the review route?
- [ ] Review:
  - [ ] Does it correctly show all user-selected configurations?
  - [ ] These accommodations are stored in browser local storage for persistence - does refreshing the page result in the settings "sticking"?
  - [ ] Does the map button correctly direct to the event map?

**Event Map**

- [ ] Does the event map load correctly with the user-configured settings?
- [ ] The map is largely a copy of the main Aggiemap map components, but there are a few differences - only test the visible differences

**Owned Paths**

- Specs: `tests/pages/events/specs`
- POM: `tests/pages/events/po`

**Dependencies**

- app-shell, map

**TestID Prefix**

- `am-events` (use only if roles/labels are insufficient)

**Definition of Done (DoD)**

- Covers required flows and states within scope
- No fixed sleeps; uses expectations or URL/request assertions
- Two consecutive green local runs with report/trace
- No edits outside your team folders
- Any new testids listed in PR description
