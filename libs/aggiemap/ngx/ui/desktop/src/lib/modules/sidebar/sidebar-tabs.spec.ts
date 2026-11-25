import { Component } from '@angular/core';

import { developmentOnlyRoute } from '@tamu-gisc/dev-tools/application-testing';

import { SIDEBAR_TABS, sidebarRoutes, sidebarTabsFor } from './sidebar-tabs';

@Component({ selector: 'tamu-gisc-reference-stub', template: '' })
class ReferenceStubComponent {}

/**
 * The side panel's tabs are declared once, for the main map and every event map (#2758). These say the declaration
 * means what each map is shown; the smoke suite's `development-only.spec.ts` checks both maps as deployed.
 */
describe('side panel tabs', () => {
  const titles = (development: boolean, tabs?: Parameters<typeof sidebarTabsFor>[0]) =>
    sidebarTabsFor(tabs ?? null, development).map((tab) => tab.title);

  it('shows every tab on development, in order', () => {
    expect(titles(true)).toEqual(['Features', 'Directions', 'Bus Routes', 'Experiments', 'Settings']);
  });

  it('leaves Experiments off where development is off, as DEVELOPMENT_ONLY_SECTIONS requires', () => {
    expect(titles(false)).toEqual(['Features', 'Directions', 'Bus Routes', 'Settings']);
  });

  it('shows only the tabs a map asks for, and never a development-only one it asks for where development is off', () => {
    expect(titles(true, { tabs: ['features'] })).toEqual(['Features']);
    expect(titles(false, { tabs: ['features', 'experiments'] })).toEqual(['Features']);
  });

  it('gives every tab a panel to open, on every map', () => {
    const paths = sidebarRoutes(ReferenceStubComponent).map((route) => route.path);

    for (const tab of SIDEBAR_TABS) {
      expect(paths).toContain(tab.route);
    }
  });

  it("opens the map's own landing panel, and keeps the trip planner's options development-only (#2801)", () => {
    const routes = sidebarRoutes(ReferenceStubComponent);

    expect(routes.find((route) => route.path === '')?.component).toBe(ReferenceStubComponent);
    expect(routes.find((route) => route.path === 'trip/options')?.canActivate).toEqual([developmentOnlyRoute]);
  });
});
