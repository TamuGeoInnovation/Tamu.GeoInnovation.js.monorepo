import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AutoLoginPartialRoutesGuard } from 'angular-auth-oidc-client';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { SidebarModule } from '@tamu-gisc/common/ngx/ui/sidebar';
import { LayerListComponent, LayerListModule } from '@tamu-gisc/maps/feature/layer-list';
import { LegendComponent, LegendModule } from '@tamu-gisc/maps/feature/legend';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { MapDrawingModule } from '@tamu-gisc/maps/feature/draw';
import { FeatureSelectorModule } from '@tamu-gisc/maps/feature/feature-selector';
import { UIClipboardModule } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';
import { MapPopupModule } from '@tamu-gisc/maps/feature/popup';
import { EsriMapModule } from '@tamu-gisc/maps/esri';

import { ParticipantComponent } from './components/participant/participant.component';
import { ViewerComponent } from './cpa-ngx-viewer.component';
import { SnapshotNavigatorComponent } from './components/snapshot-navigator/snapshot-navigator.component';
import { EventControlsComponent } from './components/event-controls/event-controls.component';
import { ParticipantListItemComponent } from './components/event-controls/components/participant-list-item/participant-list-item.component';
import { ParticipantResponsePopupComponent } from './components/participant-response-popup/participant-response-popup.component';
import { ViewerBasePopupComponent } from './components/viewer-base-popup/viewer-base-popup.component';
import { ParticipantWorkshopsListComponent } from './components/participant-workshops-list/participant-workshops-list.component';
import { ParticipantGroupListComponent } from './components/participant-group-list/participant-group-list.component';
import { MapComponent } from './components/map/map.component';

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
        component: EventControlsComponent,
        canActivate: [AutoLoginPartialRoutesGuard]
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
    MapPopupModule,
    EsriMapModule
  ],
  declarations: [
    ViewerComponent,
    SnapshotNavigatorComponent,
    ParticipantComponent,
    EventControlsComponent,
    ParticipantListItemComponent,
    ParticipantResponsePopupComponent,
    ViewerBasePopupComponent,
    ParticipantWorkshopsListComponent,
    ParticipantGroupListComponent,
    MapComponent
  ],
  exports: [RouterModule]
})
export class CpaNgxViewerModule {}
