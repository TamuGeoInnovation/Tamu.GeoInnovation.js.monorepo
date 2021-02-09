import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { MapsFormsModule } from '@tamu-gisc/maps/feature/forms';
import { EsriMapModule } from '@tamu-gisc/maps/esri';

import { ExportComponent } from './export.component';

const routes: Routes = [
  {
    path: '',
    component: ExportComponent,
    data: {
      title: 'Export'
    }
  }
];

@NgModule({
  declarations: [ExportComponent],
  exports: [ExportComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    UIFormsModule,
    UILayoutModule,
    MapsFormsModule,
    EsriMapModule
  ]
})
export class ExportModule {}
