import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { DateSelectComponent } from './date-select.component';

const routes: Routes = [{ path: '', component: DateSelectComponent }];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [DateSelectComponent]
})
export class DateSelectModule {}
