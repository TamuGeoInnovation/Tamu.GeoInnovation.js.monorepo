import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { UploadFileComponent } from './upload-file.component';
import { UploadFormInputComponent } from './components/upload-form-input/upload-form-input.component';

const routes: Routes = [
  {
    path: '',
    component: UploadFileComponent
  }
];

@NgModule({
  imports: [CommonModule, FormsModule, RouterModule.forChild(routes), ReactiveFormsModule, UIFormsModule],
  declarations: [UploadFileComponent, UploadFormInputComponent]
})
export class UploadFileModule {}
