import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { BackdropComponent } from './components/backdrop/backdrop.component';
import { ModalComponent } from './components/modal/modal.component';

@NgModule({
  imports: [CommonModule, RouterModule],
  declarations: [BackdropComponent, ModalComponent],
  exports: [BackdropComponent, ModalComponent]
})
export class AggiemapCoreUIModule {}
