import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { GisdayPlatformNgxCommonModule } from '@tamu-gisc/gisday/platform/ngx/common';
import { PipesModule } from '@tamu-gisc/common/ngx/pipes';

import { SponsorsDetailComponent } from './sponsors-detail.component';

const routes: Routes = [
  {
    path: '',
    component: SponsorsDetailComponent
  }
];

@NgModule({
  declarations: [SponsorsDetailComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    UIFormsModule,
    UILayoutModule,
    GisdayPlatformNgxCommonModule,
    PipesModule
  ],
  exports: [RouterModule]
})
export class SponsorsDetailModule {}
