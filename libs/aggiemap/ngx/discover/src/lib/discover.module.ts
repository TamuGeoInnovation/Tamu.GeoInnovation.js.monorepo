import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AggiemapNgxSharedUiStructuralModule } from '@tamu-gisc/aggiemap/ngx/ui/shared';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { PipesModule } from '@tamu-gisc/common/ngx/pipes';

import { DiscoverComponent } from './components/discover.component';

const routes: Routes = [
  {
    path: '',
    component: DiscoverComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UIFormsModule,
    UILayoutModule,
    RouterModule.forChild(routes),
    AggiemapNgxSharedUiStructuralModule,
    PipesModule
  ],
  declarations: [DiscoverComponent],
  exports: [DiscoverComponent]
})
export class DiscoverModule {}
