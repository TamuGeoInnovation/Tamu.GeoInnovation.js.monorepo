import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { CreateFormComponent } from './components/create-form/create-form.component';

const routes: Routes = [
  {
    path: '',
    component: CreateFormComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [CreateFormComponent]
})
export class CreateFormModule {}
