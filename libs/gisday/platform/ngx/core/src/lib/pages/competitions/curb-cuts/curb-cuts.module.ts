import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CurbCutsComponent } from './curb-cuts.component';
import { RouterModule, Routes } from '@angular/router';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

const routes: Routes = [
  {
    path: '',
    component: CurbCutsComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), UILayoutModule],
  declarations: [CurbCutsComponent]
})
export class CurbCutsModule {}
