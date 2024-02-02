import { Component } from '@angular/core';

import { ICompetitionSeasonFormQuestion } from '@tamu-gisc/gisday/competitions/data-api';

@Component({
  selector: 'tamu-gisc-designer',
  templateUrl: './designer.component.html',
  styleUrls: ['./designer.component.scss']
})
export class DesignerComponent {
  public formModel: ICompetitionSeasonFormQuestion[];
}
