import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { SponsorsMainComponent } from './sponsors-main.component';

const routes: Routes = [
  {
    path: '',
    component: SponsorsMainComponent
  }
];

@NgModule({
  declarations: [SponsorsMainComponent],
  imports: [CommonModule, RouterModule.forChild(routes), UIFormsModule, UILayoutModule],
  exports: [RouterModule]
})
export class SponsorsMainModule {}
