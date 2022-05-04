import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'tamu-gisc-wayback',
  templateUrl: './wayback.component.html',
  styleUrls: ['./wayback.component.scss']
})
export class WaybackComponent {
  constructor(private titleService: Title) {
    this.titleService.setTitle('Wayback | TxGIS Day 2022');
  }
}
