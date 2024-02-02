import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { GisdayFormsModule } from '@tamu-gisc/gisday/platform/ngx/common';

import { AdminUniversityComponent } from './admin-university.component';
import { UniversityEditComponent } from './pages/university-edit/university-edit.component';
import { UniversityAddComponent } from './pages/university-add/university-add.component';
import { UniversityListComponent } from './pages/university-list/university-list.component';

const routes: Routes = [
  {
    path: '',
    component: AdminUniversityComponent,
    children: [
      {
        path: 'edit/:guid',
        component: UniversityEditComponent
      },
      {
        path: 'add',
        component: UniversityAddComponent
      },
      {
        path: '',
        component: UniversityListComponent
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), GisdayFormsModule],
  declarations: [AdminUniversityComponent, UniversityEditComponent, UniversityAddComponent, UniversityListComponent],
  exports: [RouterModule]
})
export class AdminUniversityModule {}
