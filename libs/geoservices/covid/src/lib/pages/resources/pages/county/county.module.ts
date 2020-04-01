import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { CountyComponent } from './county.component';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

const routes: Routes = [
  {
    path: '',
    component: CountyComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), UIFormsModule, ReactiveFormsModule, FormsModule],
  declarations: [CountyComponent]
})
export class CountyModule {}
