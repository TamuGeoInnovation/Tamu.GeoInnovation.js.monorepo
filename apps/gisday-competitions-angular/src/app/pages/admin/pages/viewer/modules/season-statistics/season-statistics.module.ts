import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { SeasonStatisticsComponent } from './season-statistics.component';

const routes: Routes = [
  {
    path: '',
    component: SeasonStatisticsComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [SeasonStatisticsComponent]
})
export class SeasonStatisticsModule {}
