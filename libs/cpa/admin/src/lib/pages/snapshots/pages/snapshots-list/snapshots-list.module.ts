import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { SnapshotsListComponent } from './snapshots-list.component';

const routes: Routes = [
  {
    path: '',
    component: SnapshotsListComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [SnapshotsListComponent]
})
export class SnapshotsListModule {}
