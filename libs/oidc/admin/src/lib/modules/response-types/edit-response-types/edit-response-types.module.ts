import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { EditResponseTypesComponent } from './edit-response-types.component';

const routes: Routes = [
  {
    path: '',
    component: EditResponseTypesComponent,
    pathMatch: 'full'
  },
  {
    path: ':responseTypeGuid',
    loadChildren: () => import('./detail-response-type/detail-response-type.module').then((m) => m.DetailResponseTypeModule)
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), FormsModule, ReactiveFormsModule, UIFormsModule, UILayoutModule],
  declarations: [EditResponseTypesComponent],
  exports: [RouterModule]
})
export class EditResponseTypesModule {}
