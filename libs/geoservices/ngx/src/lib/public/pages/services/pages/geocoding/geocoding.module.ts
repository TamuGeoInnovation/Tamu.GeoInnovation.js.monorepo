import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { HighlightPlusModule } from 'ngx-highlightjs/plus';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { UILayoutCodeModule } from '@tamu-gisc/ui-kits/ngx/layout/code';

import { GeocodingComponent } from './geocoding.component';
import { GeoservicesCoreInteractiveModule } from '../../../../../core/modules/interactive/interactive.module';

const routes: Routes = [
  {
    path: 'interactive',
    loadChildren: () => import('./pages/interactive/interactive.module').then((m) => m.InteractiveModule)
  },
  {
    path: '',
    component: GeocodingComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    HighlightPlusModule,
    UILayoutModule,
    UILayoutCodeModule,
    GeoservicesCoreInteractiveModule
  ],
  declarations: [GeocodingComponent]
})
export class GeocodingModule {}