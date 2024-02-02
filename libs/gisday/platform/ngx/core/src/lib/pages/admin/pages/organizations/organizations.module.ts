import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { GisdayFormsModule } from '@tamu-gisc/gisday/platform/ngx/common';

import { OrganizationsComponent } from './organizations.component';
import { OrganizationListComponent } from './pages/organization-list/organization-list.component';
import { OrganizationAddComponent } from './pages/organization-add/organization-add.component';
import { OrganizationEditComponent } from './pages/organization-edit/organization-edit.component';

const routes: Routes = [
  {
    path: '',
    component: OrganizationsComponent,
    children: [
      {
        path: '',
        component: OrganizationListComponent
      },
      {
        path: 'add',
        component: OrganizationAddComponent
      },
      {
        path: 'edit/:guid',
        component: OrganizationEditComponent
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), GisdayFormsModule],
  declarations: [OrganizationsComponent, OrganizationListComponent, OrganizationAddComponent, OrganizationEditComponent]
})
export class OrganizationsModule {}
