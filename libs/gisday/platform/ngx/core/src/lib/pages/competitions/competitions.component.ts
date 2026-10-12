import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'tamu-gisc-competitions',
  templateUrl: './competitions.component.html',
  styleUrls: ['./competitions.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterOutlet]
})
export class CompetitionsComponent {
  private titleService = inject(Title);

  constructor() {
    this.titleService.setTitle('Competitions | TxGIS Day');
  }
}
