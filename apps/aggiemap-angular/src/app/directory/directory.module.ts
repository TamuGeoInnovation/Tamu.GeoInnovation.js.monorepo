import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { AggiemapCoreUIModule } from '@tamu-gisc/aggiemap';

import { DirectoryComponent } from './components/directory.component';

const routes: Routes = [
  {
    path: '',
    component: DirectoryComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), AggiemapCoreUIModule],
  declarations: [DirectoryComponent]
})
export class DirectoryModule {}
