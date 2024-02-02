import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { SeasonDayCardComponent } from './components/season-day-card/season-day-card.component';
import { EventRowComponent } from './components/event-row/event-row.component';
import { GisdayPlatformNgxCommonModule } from '../../gisday-platform-ngx-common.module';

@NgModule({
  imports: [CommonModule, RouterModule, UIFormsModule, GisdayPlatformNgxCommonModule],
  declarations: [SeasonDayCardComponent, EventRowComponent],
  exports: [SeasonDayCardComponent, EventRowComponent]
})
export class GisDayEventsModule {}
