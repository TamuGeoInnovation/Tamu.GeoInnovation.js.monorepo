import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TamuBlockBrandingComponent } from './components/tamu-block/tamu-block.component';
import { ReveilleConsoleLogComponent } from './reveille-console-log/reveille-console-log.component';

@NgModule({
  imports: [CommonModule],
  declarations: [TamuBlockBrandingComponent, ReveilleConsoleLogComponent],
  exports: [TamuBlockBrandingComponent, ReveilleConsoleLogComponent]
})
export class UITamuBrandingModule {}
