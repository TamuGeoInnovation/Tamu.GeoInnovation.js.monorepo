import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BackdropComponent } from './components/backdrop/backdrop.component';

@NgModule({
  declarations: [BackdropComponent],
  imports: [CommonModule],
  exports: [BackdropComponent]
})
export class AggiemapCoreUIModule {}
