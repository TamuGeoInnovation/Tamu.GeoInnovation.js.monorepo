import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AggiemapCoreUIModule } from '@tamu-gisc/aggiemap';

import { AboutComponent } from './components/about.component';

const routes: Routes = [
  {
    path: '',
    component: AboutComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), AggiemapCoreUIModule],
  declarations: [AboutComponent],
  exports: [AboutComponent]
})
export class AboutModule {}
