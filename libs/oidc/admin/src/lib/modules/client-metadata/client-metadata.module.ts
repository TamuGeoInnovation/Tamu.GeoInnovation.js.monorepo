import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { ClientMetadataComponent } from './client-metadata.component';

const routes: Routes = [
  {
    path: '',
    component: ClientMetadataComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./view-client-metadata/view-client-metadata.module').then((m) => m.ViewClientMetadataModule)
      },
      {
        path: 'add',
        loadChildren: () => import('./add-client-metadata/add-client-metadata.module').then((m) => m.AddClientMetadataModule)
      },
      {
        path: 'edit',
        loadChildren: () =>
          import('./edit-client-metadata/edit-client-metadata.module').then((m) => m.EditClientMetadataModule)
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), FormsModule, ReactiveFormsModule, UIFormsModule, UILayoutModule],
  declarations: [ClientMetadataComponent],
  exports: [RouterModule]
})
export class ClientMetadataModule {}
