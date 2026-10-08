import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { SponsorsTamuComponent } from './sponsors-tamu.component';

const routes: Routes = [
  {
    path: '',
    component: SponsorsTamuComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), UIFormsModule, UILayoutModule, SponsorsTamuComponent],
  exports: [RouterModule]
})
export class SponsorsTamuModule {}
