import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { PipesModule } from '@tamu-gisc/common/ngx/pipes';
import { AggiemapNgxSharedUiStructuralModule } from '@tamu-gisc/aggiemap/ngx/ui/shared';

import { ChangelogComponent } from './components/changelog.component';

const routes: Routes = [
  {
    path: '',
    component: ChangelogComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    AggiemapNgxSharedUiStructuralModule,
    PipesModule,
    ChangelogComponent
  ]
})
export class ChangelogModule {}
