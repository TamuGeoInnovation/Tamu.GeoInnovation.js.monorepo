import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PipesModule } from '@tamu-gisc/common/ngx/pipes';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { ModalHostComponent } from './components/modal-host/modal-host.component';
import { GenericModalComponent } from './components/generic-modal/generic-modal.component';

@NgModule({
  imports: [CommonModule, PipesModule, UIFormsModule],
  declarations: [ModalHostComponent, GenericModalComponent]
})
export class UiKitsNgxLayoutModalModule {}
