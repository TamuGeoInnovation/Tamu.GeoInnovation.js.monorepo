import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { LoginPostComponent } from './components/login-post/login-post.component';
import { AuthRoutingComponent } from './auth-routing.component';

const routes: Routes = [
  {
    path: 'auth',
    component: AuthRoutingComponent,
    children: [
      {
        path: 'callback',
        component: LoginPostComponent
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [LoginPostComponent, AuthRoutingComponent]
})
export class AuthRoutingModule {}
