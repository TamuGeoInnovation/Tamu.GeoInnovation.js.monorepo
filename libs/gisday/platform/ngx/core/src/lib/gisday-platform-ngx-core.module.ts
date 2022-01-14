import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { GisdayPlatformNgxCommonModule } from '@tamu-gisc/gisday/platform/ngx/common';

import { RouterModule } from '@angular/router';

@NgModule({
  imports: [CommonModule, RouterModule, GisdayPlatformNgxCommonModule],
  declarations: [],
  providers: [AuthService],
  exports: []
})
export class GisdayPlatformNgxCoreModule {}
