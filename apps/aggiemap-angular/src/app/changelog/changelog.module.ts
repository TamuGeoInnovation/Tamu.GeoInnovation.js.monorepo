import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { PipesModule } from '@tamu-gisc/common/ngx/pipes';
import { AggiemapCoreUIModule } from '@tamu-gisc/aggiemap';

import { ChangelogComponent } from './components/changelog.component';

const routes: Routes = [
  {
    path: '',
    component: ChangelogComponent
  }
];

@NgModule({
  declarations: [ChangelogComponent],
  imports: [CommonModule, RouterModule.forChild(routes), AggiemapCoreUIModule, PipesModule]
})
export class ChangelogModule {}
