import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserService } from './services/user.service';
import { AuthGroupsPipe } from './pipes/auth-groups.pipe';

import { SessionExpiredModule } from './pages/session-expired/session-expired.module';

@NgModule({
  imports: [CommonModule, SessionExpiredModule],
  declarations: [AuthGroupsPipe],
  providers: [UserService],
  exports: [AuthGroupsPipe]
})
export class AuthModule {}
