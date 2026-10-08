import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'tamu-gisc-app-event',
    templateUrl: './event.component.html',
    styleUrls: ['./event.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterOutlet]
})
export class EventComponent {
  constructor(private titleService: Title) {
    this.titleService.setTitle('Sessions | TxGIS Day');
  }
}
