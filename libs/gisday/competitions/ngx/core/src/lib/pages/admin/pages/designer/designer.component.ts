import { Component, ChangeDetectionStrategy } from '@angular/core';

import { ICompetitionSeasonFormQuestion } from '@tamu-gisc/gisday/competitions/data-api';
import { DesignFormComponent } from './components/design-form/design-form.component';

@Component({
    selector: 'tamu-gisc-designer',
    templateUrl: './designer.component.html',
    styleUrls: ['./designer.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [DesignFormComponent]
})
export class DesignerComponent {
  public formModel: ICompetitionSeasonFormQuestion[];
}
