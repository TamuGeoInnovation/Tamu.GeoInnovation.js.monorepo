import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'tamu-gisc-event-locations',
  templateUrl: './event-locations.component.html',
  styleUrls: ['./event-locations.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterOutlet]
})
export class EventLocationsComponent {}
