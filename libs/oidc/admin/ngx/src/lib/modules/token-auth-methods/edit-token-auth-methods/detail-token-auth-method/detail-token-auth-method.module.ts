import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { DetailTokenAuthMethodComponent } from './detail-token-auth-method.component';

const routes: Routes = [
  {
    path: '',
    component: DetailTokenAuthMethodComponent,
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), FormsModule, ReactiveFormsModule, UIFormsModule, UILayoutModule],
  declarations: [DetailTokenAuthMethodComponent],
  exports: [RouterModule]
})
export class DetailTokenAuthMethodModule {}
