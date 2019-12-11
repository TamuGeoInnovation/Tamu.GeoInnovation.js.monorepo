import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { PipesModule } from '@tamu-gisc/common/ngx/pipes';
import { SkeletonModule } from '../skeleton/skeleton.module';

import { ChangelogComponent } from './components/changelog.component';

const routes: Routes = [
  {
    path: '',
    component: ChangelogComponent
  }
];

@NgModule({
  declarations: [ChangelogComponent],
  imports: [CommonModule, RouterModule.forChild(routes), SkeletonModule, PipesModule]
})
export class ChangelogModule {}
