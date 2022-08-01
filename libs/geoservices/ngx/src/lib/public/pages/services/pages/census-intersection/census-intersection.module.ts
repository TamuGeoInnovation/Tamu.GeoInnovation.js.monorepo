import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { CensusIntersectionComponent } from './census-intersection.component';

const routes: Routes = [
  {
    path: '',
    component: CensusIntersectionComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [CensusIntersectionComponent]
})
export class CensusIntersectionModule {}
