import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { BackdropComponent } from './components/backdrop/backdrop.component';
import { ModalComponent } from './components/modal/modal.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

@NgModule({
  imports: [CommonModule, RouterModule],
  declarations: [BackdropComponent, ModalComponent, HeaderComponent, FooterComponent],
  exports: [BackdropComponent, ModalComponent, HeaderComponent, FooterComponent]
})
export class AggiemapNgxSharedUiStructuralModule {}
