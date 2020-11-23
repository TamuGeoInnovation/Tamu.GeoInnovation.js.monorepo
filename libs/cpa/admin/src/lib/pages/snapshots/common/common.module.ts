import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { MapsFormsModule } from '@tamu-gisc/maps/feature/forms';

import { SnapshotBuilderComponent } from './components/snapshot-builder/snapshot-builder.component';
import { SnapshotsListComponent } from './components/snapshots-list/snapshots-list.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [CommonModule, RouterModule, ReactiveFormsModule, UIFormsModule, UILayoutModule, MapsFormsModule],
  declarations: [SnapshotBuilderComponent, SnapshotsListComponent],
  exports: [SnapshotBuilderComponent, SnapshotsListComponent]
})
export class SnapshotsCommonModule {}
