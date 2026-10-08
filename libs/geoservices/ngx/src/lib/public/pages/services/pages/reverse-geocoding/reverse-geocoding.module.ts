import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { HighlightPlusModule } from 'ngx-highlightjs/plus';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { ReverseGeocodingComponent } from './reverse-geocoding.component';

const routes: Routes = [
  {
    path: 'interactive',
    loadChildren: () => import('./pages/interactive/interactive.module').then((m) => m.InteractiveModule)
  },
  {
    path: '',
    component: ReverseGeocodingComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    HighlightPlusModule,
    UILayoutModule,
    ReverseGeocodingComponent
  ]
})
export class ReverseGeocodingModule {}
