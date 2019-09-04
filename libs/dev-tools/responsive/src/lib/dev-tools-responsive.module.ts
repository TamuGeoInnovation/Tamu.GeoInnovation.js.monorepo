import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ResponsiveService } from './services/responsive.service';

@NgModule({
  imports: [CommonModule],
  providers: [ResponsiveService]
})
export class ResponsiveModule {}
