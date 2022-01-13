import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { AggiemapNgxSharedUiStructuralModule } from '@tamu-gisc/aggiemap/ngx/ui/shared';

import { PrivacyComponent } from './components/privacy.component';

const routes: Routes = [
  {
    path: '',
    component: PrivacyComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), AggiemapNgxSharedUiStructuralModule],
  declarations: [PrivacyComponent]
})
export class PrivacyModule {}
