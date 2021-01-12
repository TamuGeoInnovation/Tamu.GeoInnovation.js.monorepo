import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { CPAFormsModule } from '../forms/cpaForms.module';
import { ParticipantComponent } from '../forms/components/participant/participant.component';
import { ViewerComponent } from './viewer.component';
import { SnapshotNavigatorComponent } from './components/snapshot-navigator/snapshot-navigator.component';

const routes: Routes = [
  {
    path: '',
    component: ViewerComponent,
    children: [
      {
        path: ':guid',
        component: ParticipantComponent
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), CPAFormsModule, UILayoutModule],
  declarations: [ViewerComponent, SnapshotNavigatorComponent],
  exports: [RouterModule]
})
export class CpaViewerModule {}
