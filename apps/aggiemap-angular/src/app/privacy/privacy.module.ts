import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { SkeletonModule } from '../skeleton/skeleton.module';
import { PrivacyComponent } from './components/privacy.component';

const routes: Routes = [
  {
    path: '',
    component: PrivacyComponent
  }
];

@NgModule({
  declarations: [PrivacyComponent],
  imports: [CommonModule, RouterModule.forChild(routes), SkeletonModule]
})
export class PrivacyModule {}
