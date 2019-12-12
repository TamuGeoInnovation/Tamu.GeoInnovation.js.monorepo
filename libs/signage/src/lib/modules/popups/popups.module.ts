import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SignComponent } from './sign/sign.component';

@NgModule({
  declarations: [SignComponent],
  imports: [CommonModule],
  entryComponents: [SignComponent]
})
export class PopupsModule {}

export const Popups = { SignComponent };
