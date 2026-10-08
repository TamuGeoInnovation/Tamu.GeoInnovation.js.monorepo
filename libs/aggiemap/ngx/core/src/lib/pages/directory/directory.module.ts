import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { ReactiveFormsModule } from '@angular/forms';

import { DirectoryComponent } from './components/directory.component';

const routes: Routes = [
  {
    path: '',
    component: DirectoryComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), ReactiveFormsModule, NgxDatatableModule, DirectoryComponent]
})
export class DirectoryModule {}
