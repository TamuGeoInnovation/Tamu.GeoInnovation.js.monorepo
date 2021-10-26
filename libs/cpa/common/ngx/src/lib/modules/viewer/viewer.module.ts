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
import { UIClipboardModule } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';
import { MapPopupModule } from '@tamu-gisc/maps/feature/popup';

import { ParticipantComponent } from './components/participant/participant.component';
import { ViewerComponent } from './viewer.component';
import { SnapshotNavigatorComponent } from './components/snapshot-navigator/snapshot-navigator.component';
import { AdminControlsComponent } from './components/admin-controls/admin-controls.component';
import { ParticipantListItemComponent } from './components/admin-controls/components/participant-list-item/participant-list-item.component';

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
      },
      {
        path: 'controls',
        component: AdminControlsComponent
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
    LegendModule,
    UIClipboardModule,
    MapPopupModule
  ],
  declarations: [
    ViewerComponent,
    SnapshotNavigatorComponent,
    ParticipantComponent,
    AdminControlsComponent,
    ParticipantListItemComponent
  ],
  exports: [RouterModule]
})
export class CpaViewerModule {}
