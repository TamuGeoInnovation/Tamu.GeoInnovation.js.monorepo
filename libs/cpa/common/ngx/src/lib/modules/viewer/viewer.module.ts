import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { SidebarModule } from '@tamu-gisc/common/ngx/ui/sidebar';
import { LayerListComponent, LayerListModule } from '@tamu-gisc/maps/feature/layer-list';
import { LegendComponent, LegendModule } from '@tamu-gisc/maps/feature/legend';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { MapDrawingModule } from '@tamu-gisc/maps/feature/draw';
import { FeatureSelectorModule } from '@tamu-gisc/maps/feature/feature-selector';

import { ParticipantComponent } from './components/participant/participant.component';
import { ViewerComponent } from './viewer.component';
import { SnapshotNavigatorComponent } from './components/snapshot-navigator/snapshot-navigator.component';

const routes: Routes = [
  {
    path: '',
    component: ViewerComponent,
    children: [
      {
        path: '',
        component: ParticipantComponent
      },

      {
        path: 'layers',
        component: LayerListComponent
      },
      {
        path: 'legend',
        component: LegendComponent
      }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    UIFormsModule,
    MapDrawingModule,
    FeatureSelectorModule,
    UILayoutModule,
    SidebarModule,
    LayerListModule,
    LegendModule
  ],
  declarations: [ViewerComponent, SnapshotNavigatorComponent, ParticipantComponent],
  exports: [RouterModule]
})
export class CpaViewerModule {}
