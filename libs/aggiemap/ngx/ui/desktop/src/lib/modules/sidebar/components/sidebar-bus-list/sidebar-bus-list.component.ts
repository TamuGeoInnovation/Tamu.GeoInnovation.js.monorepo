import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TransportationModule } from '@tamu-gisc/aggiemap/ngx/ui/shared';

@Component({
  selector: 'tamu-gisc-sidebar-bus-list',
  templateUrl: './sidebar-bus-list.component.html',
  styleUrls: ['./sidebar-bus-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [TransportationModule]
})
export class SidebarBusListComponent {}
