import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { MapsFormsModule } from '@tamu-gisc/maps/feature/forms';

import { SnapshotBuilderComponent } from './snapshot-builder.component';

const routes: Routes = [
  {
    path: '',
    component: SnapshotBuilderComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    UIFormsModule,
    UILayoutModule,
    MapsFormsModule
  ],
  declarations: [SnapshotBuilderComponent]
})
export class SnapshotBuilderModule {}
