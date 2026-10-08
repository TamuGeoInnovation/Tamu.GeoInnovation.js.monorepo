import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { PipesModule } from '@tamu-gisc/common/ngx/pipes';

import { GalleryComponent } from './gallery.component';

const routes: Routes = [
  {
    path: '',
    component: GalleryComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), PipesModule, GalleryComponent],
  exports: [RouterModule]
})
export class GalleryModule {}
