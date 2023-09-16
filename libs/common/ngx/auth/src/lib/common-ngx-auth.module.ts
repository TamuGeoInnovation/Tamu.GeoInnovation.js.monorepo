import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthInterceptor } from './interceptors/auth-interceptor/auth-interceptor.service';
import { AuthService } from './services/auth/auth.service';

@NgModule({
  imports: [CommonModule],
  providers: [AuthService, AuthInterceptor]
})
export class CommonNgxAuthModule {}
