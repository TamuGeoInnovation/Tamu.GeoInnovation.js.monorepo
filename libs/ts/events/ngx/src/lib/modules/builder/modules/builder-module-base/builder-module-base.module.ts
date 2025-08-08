import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BuilderModuleBaseComponent } from './builder-module-base.component';

@NgModule({
  imports: [CommonModule],
  declarations: [BuilderModuleBaseComponent],
  exports: [BuilderModuleBaseComponent]
})
export class BuilderModuleBaseModule {}
