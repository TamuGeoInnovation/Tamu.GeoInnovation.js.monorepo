import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PresenterCardComponent } from './components/presenter-card/presenter-card.component';

@NgModule({
  imports: [CommonModule],
  declarations: [PresenterCardComponent],
  exports: [PresenterCardComponent]
})
export class GisDayPresentersModule {}

