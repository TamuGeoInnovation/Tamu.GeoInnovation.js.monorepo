import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { ServicesComponent } from './services.component';

const routes: Routes = [
  {
    path: '',
    component: ServicesComponent
  },
  {
    path: 'geocoding',
    loadChildren: () => import('./pages/geocoding/geocoding.module').then((m) => m.GeocodingModule)
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), UILayoutModule],
  declarations: [ServicesComponent]
})
export class ServicesModule {}
