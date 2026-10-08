import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';







import { AllMapsComponent } from './components/all-maps/all-maps.component';
import { ParkingMapsComponent } from './components/parking-maps/parking-maps.component';
import { EventMapsComponent } from './components/event-maps/event-maps.component';
import { MapsPageHeaderComponent } from './components/maps-page-header/maps-page-header.component';
import { MapColumnsComponent } from './components/map-columns/map-columns.component';
import { QuickLinksComponent } from './components/quick-links/quick-links.component';

/** The All Maps pages. Exported so the category pages' settings can be tested as configured. */
export const discoverRoutes: Routes = [
  {
    path: '',
    component: AllMapsComponent
  },
  {
    path: 'parking',
    component: ParkingMapsComponent
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

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(discoverRoutes),
    AllMapsComponent,
    ParkingMapsComponent,
    EventMapsComponent,
    MapsPageHeaderComponent,
    MapColumnsComponent,
    QuickLinksComponent
],
  exports: [AllMapsComponent]
})
export class DiscoverModule {}
