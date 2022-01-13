import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { BuildingBountyComponent } from './building-bounty.component';

const routes: Routes = [
  {
    path: '',
    component: BuildingBountyComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [BuildingBountyComponent]
})
export class BuildingBountyModule {}
