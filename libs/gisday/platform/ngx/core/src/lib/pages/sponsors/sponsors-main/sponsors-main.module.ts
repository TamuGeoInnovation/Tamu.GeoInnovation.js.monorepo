import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { GisdayPlatformNgxCommonModule } from '@tamu-gisc/gisday/platform/ngx/common';

import { SponsorsMainComponent } from './sponsors-main.component';

const routes: Routes = [
  {
    path: '',
    component: SponsorsMainComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), UIFormsModule, UILayoutModule, GisdayPlatformNgxCommonModule],
  declarations: [SponsorsMainComponent],
  exports: [RouterModule]
})
export class SponsorsMainModule {}
