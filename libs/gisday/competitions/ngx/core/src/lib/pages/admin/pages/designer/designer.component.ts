import { Component } from '@angular/core';

import { ICompetitionSeasonFormQuestion } from '@tamu-gisc/gisday/competitions/data-api';

@Component({
  selector: 'tamu-gisc-designer',
  templateUrl: './designer.component.html',
  styleUrls: ['./designer.component.scss'],
  standalone: false
})
export class DesignerComponent {
  public formModel: ICompetitionSeasonFormQuestion[];
}
