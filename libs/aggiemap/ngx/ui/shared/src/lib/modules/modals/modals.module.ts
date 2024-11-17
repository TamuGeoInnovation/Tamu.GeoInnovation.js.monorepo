import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { BetaPromptComponent } from './components/beta-prompt/beta-prompt.component';
import { BonfireModalComponent } from './components/bonfire-modal/bonfire-modal.component';

@NgModule({
  imports: [CommonModule, UIFormsModule],
  declarations: [BetaPromptComponent, BonfireModalComponent]
})
export class ModalsModule {}
