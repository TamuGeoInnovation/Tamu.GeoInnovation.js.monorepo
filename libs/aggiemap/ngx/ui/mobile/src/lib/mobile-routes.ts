import { Route, Routes } from '@angular/router';

import { LayerListComponent } from '@tamu-gisc/maps/feature/layer-list';
import { PopupMobileDeferredComponent } from '@tamu-gisc/maps/feature/popup';
import { BasemapGalleryComponent } from '@tamu-gisc/maps/feature/basemap';

import { OmnisearchComponent } from './components/omnisearch/omnisearch.component';
import { MobileSidebarComponent } from './components/mobile-sidebar/mobile-sidebar.component';
import { MainMobileSidebarComponent } from './components/main-mobile-sidebar/main-mobile-sidebar.component';
import {
  loadBusListBottomComponent,
  loadBusTimetableBottomComponent,
  loadTripPlannerBottomComponent,
  loadTripPlannerTopComponent
} from './lazy-components';

/**
 * The phone layout's routes, the children of a map's `m` route, for every map that has a phone layout (#2997), as
 * `sidebarRoutes` is for the desktop panel (#2758). Only the legend differs between maps: the event maps' lists the
 * map's own layers.
 *
 * The phone menu links to these relatively, so each item opens its panel on the map it is on. Its Bus Routes was
 * `/map/m/bus`, which the event maps had no route for, so it threw a visitor on the tailgating map onto the main campus
 * map; its Directions was `/map/m/trip`, the main map's.
 */
export function mobileRoutes(legend: Omit<Route, 'path'>): Routes {
  return [
    {
      path: '',
      children: [
        { path: '', component: OmnisearchComponent },
        { path: '', component: PopupMobileDeferredComponent, outlet: 'outlet-2' }
      ]
    },
    {
      path: 'trip',
      children: [
        { path: '', loadComponent: loadTripPlannerTopComponent },
        { path: '', loadComponent: loadTripPlannerBottomComponent, outlet: 'outlet-2' }
      ]
    },
    {
      path: 'search/:id',
      children: [{ path: '', component: OmnisearchComponent }]
    },
    {
      path: 'sidebar',
      component: MobileSidebarComponent,
      children: [
        { path: '', component: MainMobileSidebarComponent },
        { path: 'legend', ...legend },
        { path: 'layers', component: LayerListComponent },
        { path: 'basemap', component: BasemapGalleryComponent }
      ]
    },
    {
      path: 'bus/:route',
      children: [
        { path: '', component: OmnisearchComponent },
        { path: '', loadComponent: loadBusTimetableBottomComponent, outlet: 'outlet-2' }
      ]
    },
    {
      path: 'bus',
      children: [
        { path: '', component: OmnisearchComponent },
        { path: '', loadComponent: loadBusListBottomComponent, outlet: 'outlet-2' }
      ]
    }
  ];
}
