import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { AggiemapCoreUIModule } from '@tamu-gisc/aggiemap';

import { PrivacyComponent } from './components/privacy.component';

const routes: Routes = [
  {
    path: '',
    component: PrivacyComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), AggiemapCoreUIModule],
  declarations: [PrivacyComponent]
})
export class PrivacyModule {}
