import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { GisdayFormsModule } from '@tamu-gisc/gisday/platform/ngx/common';

import { AdminTagComponent } from './admin-tag.component';
import { TagsListComponent } from './pages/tags-list/tags-list.component';
import { TagsEditComponent } from './pages/tags-edit/tags-edit.component';
import { TagsAddComponent } from './pages/tags-add/tags-add.component';

const routes: Routes = [
  {
    path: '',
    component: AdminTagComponent,
    children: [
      {
        path: 'edit/:guid',
        component: TagsEditComponent
      },
      {
        path: 'add',
        component: TagsAddComponent
      },
      {
        path: '',
        component: TagsListComponent
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), FormsModule, ReactiveFormsModule, UIFormsModule, GisdayFormsModule],
  declarations: [AdminTagComponent, TagsEditComponent, TagsListComponent, TagsAddComponent],
  exports: [RouterModule]
})
export class AdminTagModule {}
