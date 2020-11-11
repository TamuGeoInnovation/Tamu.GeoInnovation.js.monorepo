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
        loadChildren: () => import('./pages/snapshots-list/snapshots-list.module').then((m) => m.SnapshotsListModule)
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [SnapshotsComponent]
})
export class SnapshotsModule {}
