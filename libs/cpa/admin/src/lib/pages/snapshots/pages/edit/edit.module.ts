import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { EditComponent } from './edit.component';
import { SnapshotsCommonModule } from '../../common/common.module';
import { SnapshotBuilderComponent } from '../../common/components/snapshot-builder/snapshot-builder.component';

const routes: Routes = [
  {
    path: '',
    component: EditComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: SnapshotBuilderComponent
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), SnapshotsCommonModule],
  declarations: [EditComponent]
})
export class SnapshotEditModule {}
