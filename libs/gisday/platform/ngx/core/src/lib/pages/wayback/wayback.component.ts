import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'tamu-gisc-wayback',
    templateUrl: './wayback.component.html',
    styleUrls: ['./wayback.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterOutlet]
})
export class WaybackComponent {
  constructor(private titleService: Title) {
    this.titleService.setTitle('Wayback | TxGIS Day');
  }
}
