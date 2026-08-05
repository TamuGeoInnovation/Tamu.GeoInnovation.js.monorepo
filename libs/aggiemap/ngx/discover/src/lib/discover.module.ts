import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AggiemapNgxSharedUiStructuralModule } from '@tamu-gisc/aggiemap/ngx/ui/shared';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { PipesModule } from '@tamu-gisc/common/ngx/pipes';

import { AllMapsComponent } from './components/all-maps/all-maps.component';
import { ParkingMapsComponent } from './components/parking-maps/parking-maps.component';
import { EventMapsComponent } from './components/event-maps/event-maps.component';
import { MapsPageHeaderComponent } from './components/maps-page-header/maps-page-header.component';
import { MapColumnsComponent } from './components/map-columns/map-columns.component';
import { QuickLinksComponent } from './components/quick-links/quick-links.component';

const routes: Routes = [
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
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UIFormsModule,
    UILayoutModule,
    RouterModule.forChild(routes),
    AggiemapNgxSharedUiStructuralModule,
    PipesModule
  ],
  declarations: [
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
