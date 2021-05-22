import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HighlightPlusModule } from 'ngx-highlightjs/plus';

import { UIClipboardModule } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';

import { CodeRunnerComponent } from './components/code-runner/code-runner.component';

@NgModule({
  imports: [CommonModule, HighlightPlusModule, UIClipboardModule],
  declarations: [CodeRunnerComponent],
  exports: [CodeRunnerComponent]
})
export class UILayoutCodeModule {}
