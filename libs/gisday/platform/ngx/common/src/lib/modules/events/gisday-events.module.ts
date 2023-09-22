import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { SeasonDayCardComponent } from './components/season-day-card/season-day-card.component';

@NgModule({
  imports: [CommonModule, RouterModule, UIFormsModule],
  declarations: [SeasonDayCardComponent],
  exports: [SeasonDayCardComponent]
})
export class GisDayEventsModule {}

