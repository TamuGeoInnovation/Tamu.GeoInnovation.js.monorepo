import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { EsriMapComponent } from '../../../map/esri-map.component';

const routes: Routes = [{ path: '', component: EsriMapComponent }];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)]
})
export class MoveinoutModule {}
