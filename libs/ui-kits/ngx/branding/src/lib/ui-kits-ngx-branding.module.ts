import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TestingModule } from '@tamu-gisc/dev-tools/application-testing';

import { TamuBlockBrandingComponent } from './components/tamu-block/tamu-block.component';
import { ReveilleConsoleLogComponent } from './reveille-console-log/reveille-console-log.component';

@NgModule({
  imports: [CommonModule, TestingModule],
  declarations: [TamuBlockBrandingComponent, ReveilleConsoleLogComponent],
  exports: [TamuBlockBrandingComponent, ReveilleConsoleLogComponent]
})
export class UITamuBrandingModule {}
