import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { KeyboardNavigationDirective } from './directives/keyboard-navigation/keyboard-navigation.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [KeyboardNavigationDirective],
  exports: [KeyboardNavigationDirective]
})
export class UIKeyboardModule {}
