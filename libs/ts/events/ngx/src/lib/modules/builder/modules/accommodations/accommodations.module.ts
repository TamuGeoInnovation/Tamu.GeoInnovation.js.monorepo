import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { AccommodationsComponent } from './accommodations.component';

const routes: Routes = [{ path: '', component: AccommodationsComponent }];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), AccommodationsComponent]
})
export class AccommodationsModule {}
