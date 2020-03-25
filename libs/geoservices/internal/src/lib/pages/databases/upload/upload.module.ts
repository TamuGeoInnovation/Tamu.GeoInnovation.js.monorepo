import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { UploadComponent } from './upload.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UploadFormInputComponent } from './components/upload-form-input/upload-form-input.component';

const routes: Routes = [
  {
    path: '',
    component: UploadComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), FormsModule, ReactiveFormsModule, UIFormsModule],
  declarations: [UploadComponent, UploadFormInputComponent]
})
export class UploadModule {}
