import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DragulaModule } from 'ng2-dragula';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { MapsFormsModule } from '@tamu-gisc/maps/feature/forms';
import { EsriMapModule } from '@tamu-gisc/maps/esri';

import { SnapshotBuilderComponent } from './components/snapshot-builder/snapshot-builder.component';
import { SnapshotsListComponent } from './components/snapshots-list/snapshots-list.component';
import { SnapshotListItemComponent } from './components/snapshot-list-item/snapshot-list-item.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    UIFormsModule,
    UILayoutModule,
    MapsFormsModule,
    EsriMapModule,
    DragulaModule.forRoot()
  ],
  declarations: [SnapshotBuilderComponent, SnapshotsListComponent, SnapshotListItemComponent],
  exports: [SnapshotBuilderComponent, SnapshotsListComponent]
})
export class SnapshotsCommonModule {}
