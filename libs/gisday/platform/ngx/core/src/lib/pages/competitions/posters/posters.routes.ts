import { Routes } from '@angular/router';

import { PostersComponent } from './posters.component';
import { GalleryComponent } from './gallery/gallery.component';

export const postersRoutes: Routes = [
  {
    path: '',
    component: PostersComponent
  },
  {
    path: 'gallery',
    component: GalleryComponent
  }
];
