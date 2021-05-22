import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { PostersComponent } from './posters.component';

const routes: Routes = [
  {
    path: '',
    component: PostersComponent
  }
];

@NgModule({
  declarations: [PostersComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PostersModule {}
