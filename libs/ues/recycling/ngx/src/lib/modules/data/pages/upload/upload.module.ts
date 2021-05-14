import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { UploadComponent } from './upload.component';

const routes: Routes = [
  {
    path: '',
    component: UploadComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), ReactiveFormsModule, UIFormsModule],
  declarations: [UploadComponent]
})
export class UploadModule {}
