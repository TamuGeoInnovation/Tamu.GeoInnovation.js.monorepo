import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { GisdayPlatformNgxCommonModule } from '@tamu-gisc/gisday/platform/ngx/common';

@NgModule({
  imports: [CommonModule, RouterModule, GisdayPlatformNgxCommonModule],
  declarations: [],
  providers: [],
  exports: []
})
export class GisdayPlatformNgxCoreModule {}

