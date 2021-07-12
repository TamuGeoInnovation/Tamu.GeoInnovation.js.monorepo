import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserService } from './services/user.service';
import { AuthGroupsPipe } from './pipes/auth-groups.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [AuthGroupsPipe],
  providers: [UserService],
  exports: [AuthGroupsPipe]
})
export class AuthModule {}
