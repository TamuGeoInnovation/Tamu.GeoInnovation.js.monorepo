import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { DataViewerComponent } from './data-viewer.component';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { ChartsModule } from '@tamu-gisc/charts';

const routes: Routes = [{ path: '', component: DataViewerComponent }];

@NgModule({
  declarations: [DataViewerComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    UIFormsModule,
    UILayoutModule,
    ChartsModule
  ]
})
export class DataViewerModule {}
