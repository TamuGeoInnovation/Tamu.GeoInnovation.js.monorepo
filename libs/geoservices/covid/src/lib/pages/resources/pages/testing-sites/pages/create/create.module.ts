import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { CreateComponent } from './create.component';
import { GeoservicesCoreNgxModule } from '@tamu-gisc/geoservices/core/ngx';

const routes: Routes = [
  {
    path: '',
    component: CreateComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), UIFormsModule, ReactiveFormsModule, FormsModule, GeoservicesCoreNgxModule],
  declarations: [CreateComponent]
})
export class CreateModule {}
