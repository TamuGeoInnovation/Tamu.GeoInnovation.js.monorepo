import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClipboardCopyDirective } from './directives/copy/copy.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [ClipboardCopyDirective],
  exports: [ClipboardCopyDirective]
})
export class UIClipboardModule {}
