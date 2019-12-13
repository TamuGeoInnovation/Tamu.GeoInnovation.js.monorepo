import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClipboardCopyDirective } from './directives/copy/copy.directive';
import { CopyComponent } from './components/copy/copy.component';

@NgModule({
  imports: [CommonModule],
  declarations: [ClipboardCopyDirective, CopyComponent],
  exports: [ClipboardCopyDirective, CopyComponent]
})
export class UIClipboardModule {}
