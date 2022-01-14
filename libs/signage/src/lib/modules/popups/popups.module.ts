import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SignPopupComponent } from './sign/sign.component';

@NgModule({
  declarations: [SignPopupComponent],
  imports: [CommonModule]
})
export class PopupsModule {}

export const Popups = { SignPopupComponent };
