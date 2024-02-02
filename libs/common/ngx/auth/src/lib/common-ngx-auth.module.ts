import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HasRolesPipe } from './pipes/has-roles/has-roles.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [HasRolesPipe],
  exports: [HasRolesPipe]
})
export class CommonNgxAuthModule {}
