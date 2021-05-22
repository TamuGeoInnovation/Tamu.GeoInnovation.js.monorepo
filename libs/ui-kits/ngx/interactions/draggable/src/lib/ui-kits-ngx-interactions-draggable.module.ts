import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DragDirective } from './directives/drag/drag.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [DragDirective],
  exports: [DragDirective]
})
export class UIDragModule {}
