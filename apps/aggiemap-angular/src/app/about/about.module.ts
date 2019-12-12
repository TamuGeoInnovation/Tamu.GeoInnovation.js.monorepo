import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { AboutComponent } from './components/about.component';
import { SkeletonModule } from '../skeleton/skeleton.module';

const routes: Routes = [
  {
    path: '',
    component: AboutComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), SkeletonModule],
  declarations: [AboutComponent],
  exports: [AboutComponent]
})
export class AboutModule {}
