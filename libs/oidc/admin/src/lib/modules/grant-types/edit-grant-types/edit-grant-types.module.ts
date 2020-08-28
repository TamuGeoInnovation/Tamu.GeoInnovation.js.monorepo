import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { EditGrantTypesComponent } from './edit-grant-types.component';

const routes: Routes = [
  {
    path: '',
    component: EditGrantTypesComponent,
    pathMatch: 'full'
  },
  {
    path: ':roleGuid',
    loadChildren: () => import('./detail-grant-type/detail-grant-type.module').then((m) => m.DetailGrantTypeModule)
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), FormsModule, ReactiveFormsModule, UIFormsModule, UILayoutModule],
  declarations: [EditGrantTypesComponent],
  exports: [RouterModule]
})
export class EditGrantTypesModule {}
