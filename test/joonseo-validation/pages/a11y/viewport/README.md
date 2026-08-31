# Team K — Accessibility Viewport

**Scope**

- Enter/exit keyboard-only viewport mode
- Feature navigation & selection
- Zoom & popup behavior
- ESC and standard keys behavior

**Test Checklist**

- [ ] Vision-impaired users can use keyboard navigation keys to navigate and select features within a small view window (https://aggiemap.tamu.edu/instructions)
- [ ] Can viewport mode be entered?
- [ ] Can viewport mode be exited?
- [ ] Does viewport mode display features?
- [ ] Does selecting a feature zoom?
- [ ] Does the zoom action also trigger the popup?

**Owned Paths**

- Specs: `tests/pages/a11y/viewport/specs`
- POM: `tests/pages/a11y/viewport/po`

**Dependencies**

- map

**TestID Prefix**

- `am-a11y` (use only if roles/labels are insufficient)

**Definition of Done (DoD)**

- Covers required flows and states within scope
- No fixed sleeps; uses expectations or URL/request assertions
- Two consecutive green local runs with report/trace
- No edits outside your team folders
- Any new testids listed in PR description
