import { InjectionToken, Type } from '@angular/core';
import { Routes } from '@angular/router';

import { developmentOnlyRoute } from '@tamu-gisc/dev-tools/application-testing';
import { loadTripPlannerOptionsComponent } from '@tamu-gisc/maps/feature/trip-planner';
import { ExperimentsListComponent } from '@tamu-gisc/aggiemap/ngx/ui/shared';

import { SidebarTripPlannerComponent } from './components/sidebar-trip-planner/sidebar-trip-planner.component';
import { SidebarBusListComponent } from './components/sidebar-bus-list/sidebar-bus-list.component';
import { SidebarSettingsComponent } from './components/sidebar-settings/sidebar-settings.component';

/**
 * The side panel's tabs, in order, declared once for every map that has one (#2758).
 *
 * The main map and the event maps each had a side panel of their own, near-identical and maintained separately, and
 * Bus Routes and Experiments were only ever added to the main map's. Both now render `AggiemapSidebarComponent`, which
 * draws these, and route their panels with `sidebarRoutes`, so a tab added here is on every map that has a side panel.
 */
export const SIDEBAR_TABS = [
  { id: 'features', title: 'Features', description: 'Toggle Features (Search, Layers, Legend)', icon: 'menu', route: '' },
  // On every environment since the routing network was published on production (#2804); development-only until then (#1003).
  {
    id: 'directions',
    title: 'Directions',
    description: 'Toggle directions controls (routing and way-finding)',
    icon: 'directions',
    route: 'trip'
  },
  // On every environment since #2789 (the maintainer, 9 November 2026). It was development-only until then (#1090,
  // #1229); the smoke suite's `SECTIONS_ON_EVERY_ENVIRONMENT` now fails if it is gated again.
  {
    id: 'bus',
    title: 'Bus Routes',
    description: 'Toggle bus controls (list and timetable)',
    icon: 'directions_bus',
    route: 'bus'
  },
  // Development only, as the smoke suite's `DEVELOPMENT_ONLY_SECTIONS` requires.
  {
    id: 'experiments',
    title: 'Experiments',
    description: 'Aggiemap Experiments',
    icon: 'science',
    route: 'experiments',
    developmentOnly: true
  },
  { id: 'settings', title: 'Settings', description: 'Settings', icon: 'settings', route: 'settings' }
] as const;

export type SidebarTab = (typeof SIDEBAR_TABS)[number] & { developmentOnly?: boolean };
export type SidebarTabId = SidebarTab['id'];

/** What a map changes about its side panel. Every map shows every tab and the TAMU block unless it says otherwise. */
export interface SidebarOptions {
  /** The tabs to show, from those the environment allows. Satellite-campus maps show only Features. */
  tabs?: SidebarTabId[];
  /** An image shown in place of the TAMU block, such as a campus's own logo, and its alternative text. */
  brandingIconUrl?: string;
  brandingIconAlt?: string;
}

/** Provided by a map whose side panel differs from the main map's; the event maps provide it from their definition. */
export const SIDEBAR_OPTIONS = new InjectionToken<SidebarOptions>('SIDEBAR_OPTIONS');

/** The tabs a side panel shows: those a map asks for, less the development-only ones where development is off. */
export function sidebarTabsFor(options: SidebarOptions | null, development: boolean): SidebarTab[] {
  return (SIDEBAR_TABS as readonly SidebarTab[]).filter(
    (tab) => (development || !tab.developmentOnly) && (!options?.tabs || options.tabs.includes(tab.id))
  );
}

/**
 * The panels behind the tabs, for a desktop side panel's child routes. Only the landing panel differs between maps: the
 * event maps' lists the map's own layers and legend.
 */
export function sidebarRoutes(reference: Type<unknown>): Routes {
  return [
    { path: '', component: reference },
    { path: 'bus', component: SidebarBusListComponent },
    { path: 'trip', component: SidebarTripPlannerComponent },
    {
      path: 'trip/options',
      loadComponent: loadTripPlannerOptionsComponent,
      // Development only, as its link is (#2801): its one option is accessible routing, which the routing network
      // does not support yet. On production its address goes back to the trip planner.
      canActivate: [developmentOnlyRoute],
      data: { developmentOnly: 'accessible routing is not supported by the routing network (#2801)' }
    },
    { path: 'experiments', component: ExperimentsListComponent },
    { path: 'settings', component: SidebarSettingsComponent }
  ];
}
