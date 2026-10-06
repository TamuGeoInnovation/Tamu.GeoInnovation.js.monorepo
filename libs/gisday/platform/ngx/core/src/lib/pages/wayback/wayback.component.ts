import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'tamu-gisc-wayback',
  templateUrl: './wayback.component.html',
  styleUrls: ['./wayback.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class WaybackComponent {
  constructor(private titleService: Title) {
    this.titleService.setTitle('Wayback | TxGIS Day');
  }
}
