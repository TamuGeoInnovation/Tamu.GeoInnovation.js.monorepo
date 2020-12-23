import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TWOHeaderComponent } from './header.component';

@NgModule({
  declarations: [TWOHeaderComponent],
  imports: [CommonModule, RouterModule],
  exports: [TWOHeaderComponent]
})
export class TWOHeaderModule {}
