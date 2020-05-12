import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

import { GeoservicesCoreNgxModule } from '@tamu-gisc/geoservices/core/ngx';
import { LoginComponent } from './login.component';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'http://localhost:3333/api/oidc/login',
      },

    ]
  }
];

@NgModule({
  imports: [CommonModule, GeoservicesCoreNgxModule, RouterModule.forChild(routes)],
  declarations: [LoginComponent]
})
export class LoginModule {}
