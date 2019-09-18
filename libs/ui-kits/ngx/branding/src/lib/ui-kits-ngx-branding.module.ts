import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TamuBlockBrandingComponent } from './components/tamu-block/tamu-block.component';

@NgModule({
  imports: [CommonModule],
  declarations: [TamuBlockBrandingComponent],
  exports: [TamuBlockBrandingComponent]
})
export class TamuBrandingModule {}
