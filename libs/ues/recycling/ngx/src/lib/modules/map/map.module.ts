import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { UESCoreUIModule } from '@tamu-gisc/ues/common/ngx';
import { MapsFeatureCoordinatesModule } from '@tamu-gisc/maps/feature/coordinates';
import { MapsFeatureAccessibilityModule } from '@tamu-gisc/maps/feature/accessibility';
import { LayerListModule } from '@tamu-gisc/maps/feature/layer-list';
import { ChartsModule } from '@tamu-gisc/charts';

import { MapComponent } from './map.component';
import { OmnitoolbarComponent } from './components/omnitoolbar/omnitoolbar.component';
import { TotalRecycledCardComponent } from './components/total-recycled-card/total-recycled-card.component';
import { RecyclingService } from '../core/services/recycling.service';
import { RecycledTrendsCardComponent } from './components/recycled-trends-card/recycled-trends-card.component';

const routes: Routes = [
  {
    path: '',
    component: MapComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    EsriMapModule,
    UESCoreUIModule,
    MapsFeatureCoordinatesModule,
    MapsFeatureAccessibilityModule,
    LayerListModule,
    ChartsModule
  ],
  declarations: [MapComponent, OmnitoolbarComponent, TotalRecycledCardComponent, RecycledTrendsCardComponent],
  providers: [RecyclingService]
})
export class MapModule {}
