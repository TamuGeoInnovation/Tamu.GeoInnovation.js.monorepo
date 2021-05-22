import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EnvironmentService } from './services/environment.service';

@NgModule({
  imports: [CommonModule],
  providers: [EnvironmentService]
})
export class EnvironmentModule {}
