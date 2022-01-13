import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { DataViewerComponent } from './data-viewer.component';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { UiKitsNgxChartsModule } from '@tamu-gisc/ui-kits/ngx/charts';

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
    UiKitsNgxChartsModule
  ]
})
export class DataViewerModule {}
