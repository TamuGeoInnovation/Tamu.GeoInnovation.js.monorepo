import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CompetitionSessionComponent } from '../competition-session/competition-session.component';

@Component({
  selector: 'tamu-gisc-presentation',
  templateUrl: './presentation.component.html',
  styleUrls: ['./presentation.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink, CompetitionSessionComponent]
})
export class PresentationComponent {}
