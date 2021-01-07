import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from '@tamu-gisc/gisday/data-access';
import { GisdayCommonModule } from '@tamu-gisc/gisday/common';

import { RouterModule } from '@angular/router';

@NgModule({
  imports: [CommonModule, RouterModule, GisdayCommonModule],
  declarations: [],
  providers: [AuthService],
  exports: []
})
export class GisdayNgxModule {}
