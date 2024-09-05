import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { InteractiveComponent } from './interactive.component';
import { GeoservicesCoreInteractiveModule } from '../../../../../../../core/modules/interactive/interactive.module';

const routes: Routes = [
  {
    path: '',
    component: InteractiveComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), GeoservicesCoreInteractiveModule],
  declarations: [InteractiveComponent]
})
export class InteractiveModule {}
