import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from './auth/auth.service';

@NgModule({
  imports: [CommonModule],
  declarations: [],
  providers: [AuthService]
})
export class DataAccessModule {}
