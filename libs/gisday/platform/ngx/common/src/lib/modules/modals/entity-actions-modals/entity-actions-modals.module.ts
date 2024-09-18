import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { EntityCopyModalComponent } from './entity-copy-modal/entity-copy-modal.component';
import { EntityDeleteModalComponent } from './entity-delete-modal/entity-delete-modal.component';

@NgModule({
  imports: [CommonModule, UIFormsModule],
  declarations: [EntityCopyModalComponent, EntityDeleteModalComponent],
  exports: [EntityCopyModalComponent, EntityDeleteModalComponent]
})
export class EntityActionModalsModule {}
