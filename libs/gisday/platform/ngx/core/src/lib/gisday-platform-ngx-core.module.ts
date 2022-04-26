import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AuthService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { GisdayPlatformNgxCommonModule } from '@tamu-gisc/gisday/platform/ngx/common';

@NgModule({
  imports: [CommonModule, RouterModule, GisdayPlatformNgxCommonModule],
  declarations: [],
  providers: [AuthService],
  exports: []
})
export class GisdayPlatformNgxCoreModule {}
