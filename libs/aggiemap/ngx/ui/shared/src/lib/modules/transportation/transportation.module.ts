import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { BusListComponent } from './components/bus-list/bus-list.component';
import { BusListHeaderComponent } from './components/bus-list-header/bus-list-header.component';
import { BusRouteComponent } from './components/bus-route/bus-route.component';
import { BusTimetableComponent } from './components/bus-timetable/bus-timetable.component';

@NgModule({
  imports: [CommonModule, UILayoutModule],
  declarations: [BusListComponent, BusListHeaderComponent, BusRouteComponent, BusTimetableComponent],
  exports: [BusListComponent, BusListHeaderComponent, BusRouteComponent, BusTimetableComponent]
})
export class TransportationModule {}
