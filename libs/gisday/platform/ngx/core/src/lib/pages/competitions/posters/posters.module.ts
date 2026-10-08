import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { PostersComponent } from './posters.component';
import { GalleryComponent } from './gallery/gallery.component';

const routes: Routes = [
  {
    path: '',
    component: PostersComponent
  },
  {
    path: 'gallery',
    component: GalleryComponent
  }
];

@NgModule({
    imports: [CommonModule, RouterModule.forChild(routes), PostersComponent],
    exports: [RouterModule]
})
export class PostersModule {}
