import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthInterceptor } from './services/auth-interceptor.service';
import { AuthService } from './services/auth.service';

@NgModule({
  imports: [CommonModule],
  providers: [AuthService, AuthInterceptor]
})
export class CommonNgxAuthModule {}
