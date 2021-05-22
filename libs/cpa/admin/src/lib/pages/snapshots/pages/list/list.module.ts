import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { ListComponent } from './list.component';
import { SnapshotsCommonModule } from '../../common/common.module';
import { SnapshotsListComponent } from '../../common/components/snapshots-list/snapshots-list.component';
import { SnapshotBuilderComponent } from '../../common/components/snapshot-builder/snapshot-builder.component';

const routes: Routes = [
  {
    path: '',
    component: ListComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: SnapshotsListComponent
      },
      {
        path: 'create',
        component: SnapshotBuilderComponent
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), SnapshotsCommonModule],
  declarations: [ListComponent]
})
export class SnapshotListModule {}
