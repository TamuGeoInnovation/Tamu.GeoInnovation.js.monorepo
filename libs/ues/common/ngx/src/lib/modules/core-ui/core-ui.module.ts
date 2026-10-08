import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UESTamuBlockComponent } from './components/branding/ues-tamu-block/ues-tamu-block.component';

@NgModule({
  imports: [CommonModule, UESTamuBlockComponent],
  exports: [UESTamuBlockComponent]
})
export class UESCoreUIModule {}
