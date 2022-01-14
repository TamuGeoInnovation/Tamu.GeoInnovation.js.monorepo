import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { EditClientMetadataComponent } from './edit-client-metadata.component';

const routes: Routes = [
  {
    path: '',
    component: EditClientMetadataComponent,
    pathMatch: 'full'
  },
  {
    path: ':clientMetadataGuid',
    loadChildren: () =>
      import('./detail-client-metadata/detail-client-metadata.module').then((m) => m.DetailClientMetadataModule)
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), FormsModule, ReactiveFormsModule, UIFormsModule, UILayoutModule],
  declarations: [EditClientMetadataComponent],
  exports: [RouterModule]
})
export class EditClientMetadataModule {}
