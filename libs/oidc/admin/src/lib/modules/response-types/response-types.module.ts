import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { ResponseTypesComponent } from './response-types.component';

const routes: Routes = [
  {
    path: '',
    component: ResponseTypesComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./view-response-types/view-response-types.module').then((m) => m.ViewResponseTypesModule)
      },
      {
        path: 'add',
        loadChildren: () => import('./add-response-types/add-response-types.module').then((m) => m.AddResponseTypesModule)
      },
      {
        path: 'edit',
        loadChildren: () => import('./edit-response-types/edit-response-types.module').then((m) => m.EditResponseTypesModule)
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), FormsModule, ReactiveFormsModule, UIFormsModule, UILayoutModule],
  declarations: [ResponseTypesComponent],
  exports: [RouterModule]
})
export class ResponseTypesModule {}
