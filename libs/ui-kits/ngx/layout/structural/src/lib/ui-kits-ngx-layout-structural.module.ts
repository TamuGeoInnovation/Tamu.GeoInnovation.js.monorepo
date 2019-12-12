import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RenderHostDirective } from './directives/render-host/render-host.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [RenderHostDirective],
  exports: [RenderHostDirective]
})
export class UIStructuralLayoutModule {}
