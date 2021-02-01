import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { SidebarModule } from '@tamu-gisc/common/ngx/ui/sidebar';
import { LayerListModule } from '@tamu-gisc/maps/feature/layer-list';

import { CPAFormsModule } from '../forms/cpaForms.module';
import { ParticipantComponent } from '../forms/components/participant/participant.component';
import { ScenarioComponent } from '../forms/components/scenario/scenario.component';
import { ViewerComponent } from './viewer.component';
import { SnapshotNavigatorComponent } from './components/snapshot-navigator/snapshot-navigator.component';

const routes: Routes = [
  {
    path: '',
    component: ViewerComponent,
    children: [
      {
        path: 'workshop/:guid',
        component: ParticipantComponent
      },
      {
        path: 'scenario/:guid',
        component: ScenarioComponent
      }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CPAFormsModule,
    UILayoutModule,
    SidebarModule,
    LayerListModule,
    UIFormsModule
  ],
  declarations: [ViewerComponent, SnapshotNavigatorComponent],
  exports: [RouterModule]
})
export class CpaViewerModule {}
