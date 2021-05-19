import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExpandableCardComponent } from './components/expandable-card/expandable-card.component';

@NgModule({
  imports: [CommonModule],
  declarations: [ExpandableCardComponent],
  exports: [ExpandableCardComponent]
})
export class ValveCoreModule {}
