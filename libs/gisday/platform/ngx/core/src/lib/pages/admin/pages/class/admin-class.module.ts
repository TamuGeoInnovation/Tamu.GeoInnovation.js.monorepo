import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { GisdayFormsModule } from '@tamu-gisc/gisday/platform/ngx/common';

import { AdminClassComponent } from './admin-class.component';
import { ClassListComponent } from './pages/class-list/class-list.component';
import { ClassEditComponent } from './pages/class-edit/class-edit.component';
import { ClassAddComponent } from './pages/class-add/class-add.component';

const routes: Routes = [
  {
    path: '',
    component: AdminClassComponent,
    children: [
      {
        path: 'edit/:guid',
        component: ClassEditComponent
      },
      {
        path: 'add',
        component: ClassAddComponent
      },
      {
        path: '',
        component: ClassListComponent
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), GisdayFormsModule],
  declarations: [AdminClassComponent, ClassListComponent, ClassEditComponent, ClassAddComponent],
  exports: [RouterModule]
})
export class AdminClassModule {}
