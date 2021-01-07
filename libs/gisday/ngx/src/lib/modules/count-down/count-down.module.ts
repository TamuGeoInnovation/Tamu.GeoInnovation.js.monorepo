import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CountDownComponent } from './count-down.component';

@NgModule({
  declarations: [CountDownComponent],
  imports: [CommonModule],
  exports: [CountDownComponent]
})
export class CountDownModule {}
