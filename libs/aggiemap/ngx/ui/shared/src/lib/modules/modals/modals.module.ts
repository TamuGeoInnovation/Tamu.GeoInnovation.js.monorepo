import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { BetaPromptComponent } from './components/beta-prompt/beta-prompt.component';
import { BonfireModalComponent } from './components/bonfire-modal/bonfire-modal.component';
import { EventPassedWarningComponent } from './components/event-passed-warning/event-passed-warning.component';
import { AlertModalComponent } from './components/alert-modal/alert-modal.component';
import { MapNoticeComponent } from './components/map-notice/map-notice.component';

@NgModule({
  imports: [
    CommonModule,
    UIFormsModule,
    BetaPromptComponent,
    BonfireModalComponent,
    EventPassedWarningComponent,
    AlertModalComponent,
    MapNoticeComponent
  ],
  exports: [BetaPromptComponent, BonfireModalComponent, EventPassedWarningComponent, AlertModalComponent, MapNoticeComponent]
})
export class ModalsModule {}
