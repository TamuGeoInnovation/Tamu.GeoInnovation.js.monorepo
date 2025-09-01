import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AggiemapNgxSharedUiStructuralModule } from '@tamu-gisc/aggiemap/ngx/ui/shared';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

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
    RouterModule.forChild(routes),
    AggiemapNgxSharedUiStructuralModule
  ],
  declarations: [DiscoverComponent],
  exports: [DiscoverComponent]
})
export class DiscoverModule {}
