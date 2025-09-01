import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { AggiemapNgxSharedUiStructuralModule } from '@tamu-gisc/aggiemap/ngx/ui/shared';
import { ReactiveFormsModule } from '@angular/forms';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { DirectoryComponent } from './components/directory.component';

const routes: Routes = [
  {
    path: '',
    component: DirectoryComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    UIFormsModule,
    AggiemapNgxSharedUiStructuralModule,
    NgxDatatableModule
  ],
  declarations: [DirectoryComponent]
})
export class DirectoryModule {}
