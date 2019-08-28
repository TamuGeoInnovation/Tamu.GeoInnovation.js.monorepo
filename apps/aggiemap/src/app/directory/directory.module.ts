import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { SkeletonModule } from '../skeleton/skeleton.module';
import { DirectoryComponent } from './components/directory.component';

const routes: Routes = [
  {
    path: '',
    component: DirectoryComponent
  }
];

@NgModule({
  declarations: [DirectoryComponent],
  imports: [CommonModule, RouterModule.forChild(routes), SkeletonModule]
})
export class DirectoryModule {}
