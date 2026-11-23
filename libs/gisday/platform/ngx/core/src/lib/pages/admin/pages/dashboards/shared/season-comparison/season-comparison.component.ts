import { Component, input } from '@angular/core';

import { SeasonComparison } from './season-comparison';

/**
 * The year buttons above a dashboard's chart (#3215): one per season, newest first, each showing or hiding that year's
 * line, lined up on GIS Day week. The selected season's is always pressed; a year that cannot be shown says why.
 */
@Component({
  selector: 'tamu-gisc-season-comparison',
  templateUrl: './season-comparison.component.html',
  styleUrls: ['./season-comparison.component.scss']
})
export class SeasonComparisonComponent {
  public readonly comparison = input.required<SeasonComparison>();
}
