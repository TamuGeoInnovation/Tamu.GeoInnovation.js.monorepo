import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { EsriMapModule } from '@tamu-gisc/maps/esri';

import { ViewerComponent } from './viewer.component';

const routes: Routes = [
  {
    path: '',
    component: ViewerComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), EsriMapModule],
  declarations: [ViewerComponent]
})
export class ViewerModule {}
