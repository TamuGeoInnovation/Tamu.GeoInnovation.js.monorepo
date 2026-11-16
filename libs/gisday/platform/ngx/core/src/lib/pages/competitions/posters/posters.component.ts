import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CompetitionSessionComponent } from '../competition-session/competition-session.component';

@Component({
  selector: 'tamu-gisc-posters',
  templateUrl: './posters.component.html',
  styleUrls: ['./posters.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink, CompetitionSessionComponent]
})
export class PostersComponent {}
