import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'tamu-gisc-competitions',
    templateUrl: './competitions.component.html',
    styleUrls: ['./competitions.component.scss'],
    standalone: false
})
export class CompetitionsComponent {
  constructor(private titleService: Title) {
    this.titleService.setTitle('Competitions | TxGIS Day');
  }
}
