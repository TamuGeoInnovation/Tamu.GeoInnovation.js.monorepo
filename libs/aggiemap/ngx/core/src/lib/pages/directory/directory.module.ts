import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { AggiemapNgxSharedUiStructuralModule } from '@tamu-gisc/aggiemap/ngx/ui/shared';

import { DirectoryComponent } from './components/directory.component';

const routes: Routes = [
  {
    path: '',
    component: DirectoryComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), AggiemapNgxSharedUiStructuralModule],
  declarations: [DirectoryComponent]
})
export class DirectoryModule {}
