import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { EditComponent } from './edit.component';

const routes: Routes = [
  {
    path: '',
    component: EditComponent,
    pathMatch: 'full'
  },
  {
    path: ':guid',
    loadChildren: () => import('./detail/detail.module').then((m) => m.DetailModule)
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), FormsModule, ReactiveFormsModule, UIFormsModule, UILayoutModule],
  declarations: [EditComponent],
  exports: [RouterModule]
})
export class EditModule {}

