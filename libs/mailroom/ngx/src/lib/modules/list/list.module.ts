import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { ListComponent } from './list.component';
import { DetailComponent } from './pages/detail/detail.component';
import { DeleteEmailModalComponent } from './modal/delete-email-modal.component';

const routes: Routes = [
  {
    path: '',
    component: ListComponent
  },
  {
    path: 'detail/:id',
    component: DetailComponent
  }
];

@NgModule({
    imports: [CommonModule, RouterModule.forChild(routes), ListComponent, DetailComponent, DeleteEmailModalComponent]
})
export class ListModule {}
