import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { GeoservicesCoreNgxModule } from '@tamu-gisc/geoservices/core/ngx';


import { MyDashboardComponent } from './my-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: MyDashboardComponent
  }
];


@NgModule({
  declarations: [MyDashboardComponent],
  imports: [CommonModule, GeoservicesCoreNgxModule, RouterModule.forChild(routes), UIFormsModule, ReactiveFormsModule, FormsModule]
})
export class MyDashboardModule { }
