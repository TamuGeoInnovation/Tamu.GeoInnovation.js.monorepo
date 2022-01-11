import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';
import { UITamuBrandingModule } from '@tamu-gisc/ui-kits/ngx/branding';
import { MapPopupModule } from '@tamu-gisc/maps/feature/popup';
import { SearchModule } from '@tamu-gisc/ui-kits/ngx/search';
import { MapsFeatureTripPlannerModule } from '@tamu-gisc/maps/feature/trip-planner';
import { LayerListModule } from '@tamu-gisc/maps/feature/layer-list';
import { LegendModule } from '@tamu-gisc/maps/feature/legend';
import { SidebarModule } from '@tamu-gisc/common/ngx/ui/sidebar';
import { UESCoreUIModule } from '@tamu-gisc/ues/common/ngx';
import { ChartsModule } from '@tamu-gisc/charts';

import { UESEffluentCoreModule } from '../core/core.module';
import { SidebarComponent } from './sidebar.component';
import { SidebarReferenceComponent } from './components/sidebar-reference/sidebar-reference.component';
import { SidebarRelationshipsComponent } from './components/sidebar-relationships/sidebar-relationships.component';
import { SidebarOverviewComponent } from './components/sidebar-overview/sidebar-overview.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    UITamuBrandingModule,
    SidebarModule,
    MapPopupModule,
    SearchModule,
    MapsFeatureTripPlannerModule,
    LayerListModule,
    LegendModule,
    UESCoreUIModule,
    ChartsModule,
    UESEffluentCoreModule
  ],
  declarations: [SidebarComponent, SidebarReferenceComponent, SidebarRelationshipsComponent, SidebarOverviewComponent],
  exports: [SidebarComponent]
})
export class UESEffluentSidebarModule {}
