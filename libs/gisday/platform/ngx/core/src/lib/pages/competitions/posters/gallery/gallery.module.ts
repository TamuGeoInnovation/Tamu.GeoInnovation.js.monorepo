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
  declarations: [GalleryComponent],
  imports: [CommonModule, RouterModule.forChild(routes), PipesModule],
  exports: [RouterModule]
})
export class GalleryModule {}
