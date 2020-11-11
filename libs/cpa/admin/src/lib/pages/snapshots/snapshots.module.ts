import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { SnapshotsComponent } from './snapshots.component';

const routes: Routes = [
  {
    path: '',
    component: SnapshotsComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadChildren: () => import('./pages/snapshots-list/snapshots-list.module').then((m) => m.SnapshotsListModule),
        data: {
          title: 'Snapshots'
        }
      },
      {
        path: 'edit/:guid',
        loadChildren: () => import('./pages/snapshot-builder/snapshot-builder.module').then((m) => m.SnapshotBuilderModule),
        data: {
          title: 'Edit Snapshot'
        }
      },
      {
        path: 'create',
        loadChildren: () => import('./pages/snapshot-builder/snapshot-builder.module').then((m) => m.SnapshotBuilderModule),
        data: {
          title: 'Create Snapshot'
        }
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [SnapshotsComponent]
})
export class SnapshotsModule {}
