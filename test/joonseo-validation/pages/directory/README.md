# Team J — Building Directory

**Scope**

- Loading state
- Filtering/search truthy/falsy
- Empty-state messaging

**Test Checklist**

- [ ] Does it show a loading state?
- [ ] Does searching and filtering work for truthy/falsy values?
- [ ] Does a falsy result show a message?

**Owned Paths**

- Specs: `tests/pages/directory/specs`
- POM: `tests/pages/directory/po`

**Dependencies**

- app-shell

**TestID Prefix**

- `am-directory` (use only if roles/labels are insufficient)

**Definition of Done (DoD)**

- Covers required flows and states within scope
- No fixed sleeps; uses expectations or URL/request assertions
- Two consecutive green local runs with report/trace
- No edits outside your team folders
- Any new testids listed in PR description
