import { Routes } from '@angular/router';

import { AllMapsComponent } from './components/all-maps/all-maps.component';
import { ParkingMapsComponent } from './components/parking-maps/parking-maps.component';
import { EventMapsComponent } from './components/event-maps/event-maps.component';

/** The All Maps pages. Exported so the category pages' settings can be tested as configured. */
export const discoverRoutes: Routes = [
  {
    path: '',
    component: AllMapsComponent
  },
  {
    path: 'parking-transportation',
    component: ParkingMapsComponent
  },
  {
    // The section's address until #2910, when it was renamed to match what the page lists: buses and
    // transportation above parking, since #2895. It is kept rather than retired because it has been the
    // parking listing's address for years and is linked from outside this repository - the same reason
    // `/parking/<id>` still reaches a map now addressed `/transportation/<id>` (#2767).
    // `discover.routes.spec.ts` holds it open, so removing it fails a test rather than a visitor's link.
    path: 'parking',
    redirectTo: 'parking-transportation',
    pathMatch: 'full'
  },
  {
    path: 'campus-events',
    component: EventMapsComponent,
    data: {
      mapType: 'campus',
      title: 'Campus Events',
      intro: 'Browse campus event maps for transportation, parking, and special events.',
      columns: [
        { id: 'fall', heading: 'Fall' },
        { id: 'spring', heading: 'Spring' },
        { id: 'summer', heading: 'Summer' }
      ]
    }
  },
  {
    path: 'athletics-events',
    component: EventMapsComponent,
    data: {
      mapType: 'athletics',
      title: 'Athletics Events',
      intro: 'Browse athletic event maps for gameday parking and transportation information.'
    }
  },
  {
    path: 'operations',
    component: EventMapsComponent,
    data: {
      mapType: 'operations',
      title: 'Operations Maps',
      intro: 'Browse operations-focused maps for campus construction and future internal-use overlays.'
    }
  },
  {
    path: '150',
    component: EventMapsComponent,
    data: {
      mapType: '150',
      title: '150th Anniversary',
      intro: 'Browse maps for the events marking the 150th anniversary of Texas A&M University.'
    }
  },
  {
    path: 'campus',
    component: EventMapsComponent,
    data: {
      mapType: 'satellite-campus',
      title: 'Campus Maps',
      intro: 'Browse single-basemap maps for TAMU campuses outside of College Station.',
      // The quick links and the Main Campus Parking Map button are College Station's, and have
      // nothing to do with the other campuses (#1291).
      quickLinks: false,
      mainParking: false
    }
  }
];
