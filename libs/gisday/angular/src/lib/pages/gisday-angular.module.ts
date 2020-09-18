import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { GISDayAngularComponent } from './gisday-angular.component';

import { HeaderModule } from '../modules/header/header.module';
import { FooterModule } from '../modules/footer/footer.module';

const routes: Routes = [
  {
    path: '',
    component: GISDayAngularComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadChildren: () => import('./landing/landing.module').then((m) => m.LandingModule)
      },
      {
        path: 'sessions',
        loadChildren: () => import('./sessions/sessions.module').then((m) => m.SessionsModule)
      }
      // {
      //   path: 'add',
      //   loadChildren: () => import('./add-role/add-role.module').then((m) => m.AddRoleModule)
      // },
      // {
      //   path: 'edit',
      //   loadChildren: () => import('./edit-role/edit-role.module').then((m) => m.EditRoleModule)
      // }
    ]
  }
];

@NgModule({
  declarations: [GISDayAngularComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FooterModule,
    FormsModule,
    HeaderModule,
    ReactiveFormsModule,
    UIFormsModule,
    UILayoutModule
  ]
})
export class GISDayAngularModule {}
