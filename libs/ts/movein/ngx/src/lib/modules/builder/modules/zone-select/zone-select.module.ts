import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { ZoneSelectComponent } from './zone-select.component';

const routes: Routes = [{ path: '', component: ZoneSelectComponent }];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [ZoneSelectComponent]
})
export class ZoneSelectModule {}
