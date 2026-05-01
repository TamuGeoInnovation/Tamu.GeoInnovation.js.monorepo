import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { AggiemapNgxSharedUiStructuralModule } from '@tamu-gisc/aggiemap/ngx/ui/shared';

import { RequestingMapsComponent } from './components/requesting-maps.component';

const routes: Routes = [
  {
    path: '',
    component: RequestingMapsComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), AggiemapNgxSharedUiStructuralModule],
  declarations: [RequestingMapsComponent]
})
export class RequestingMapsModule {}
