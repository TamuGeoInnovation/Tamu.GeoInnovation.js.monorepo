import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RenderHostDirective } from './directives/render-host/render-host.directive';
import { ElementInsertDirective } from './directives//element-insert/element-insert.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [RenderHostDirective, ElementInsertDirective],
  exports: [RenderHostDirective, ElementInsertDirective]
})
export class UIStructuralLayoutModule {}
