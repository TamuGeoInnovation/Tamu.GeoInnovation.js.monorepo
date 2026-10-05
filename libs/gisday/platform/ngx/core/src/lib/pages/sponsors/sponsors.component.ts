import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'tamu-gisc-sponsors',
  templateUrl: './sponsors.component.html',
  styleUrls: ['./sponsors.component.scss'],
  standalone: false
})
export class SponsorsComponent {
  constructor(private titleService: Title) {
    this.titleService.setTitle('Sponsors | TxGIS Day');
  }
}
