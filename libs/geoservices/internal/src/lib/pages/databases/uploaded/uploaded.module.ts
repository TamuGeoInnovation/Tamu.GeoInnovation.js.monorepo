import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { UploadedComponent } from './uploaded.component';

const routes: Routes = [
  {
    path: '',
    component: UploadedComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [UploadedComponent]
})
export class UploadedModule {}
