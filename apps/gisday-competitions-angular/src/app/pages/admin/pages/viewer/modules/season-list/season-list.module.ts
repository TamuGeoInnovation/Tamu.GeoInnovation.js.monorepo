import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { SeasonListComponent } from './season-list.component';

const routes: Routes = [
  {
    path: '',
    component: SeasonListComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [SeasonListComponent]
})
export class SeasonListModule {}
