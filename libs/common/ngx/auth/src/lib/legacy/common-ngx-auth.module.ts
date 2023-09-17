import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LegacyAuthInterceptorProvider } from './interceptors/auth-interceptor/auth-interceptor.service';
import { LegacyAuthService } from './services/auth/auth.service';

/**
 * DEPRECATED
 */
@NgModule({
  imports: [CommonModule],
  providers: [LegacyAuthService, LegacyAuthInterceptorProvider]
})
export class CommonNgxAuthModule {}
