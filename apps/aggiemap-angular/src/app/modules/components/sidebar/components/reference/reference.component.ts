import { Component } from '@angular/core';

import { AltSearchHelper } from '../../../../helper/alt-search.service';
import { TripPoint } from '@tamu-gisc/maps/feature/trip-planner';

/**
 * Desktop sidebar component that displays the main search component as well as layer list and legend.
 */
@Component({
  selector: 'app-reference',
  templateUrl: './reference.component.html',
  styleUrls: ['./reference.component.scss'],
  providers: [AltSearchHelper]
})
export class ReferenceComponent {
  constructor(private helper: AltSearchHelper) {}

  public onSearchResult(point: TripPoint) {
    this.helper.handleSearchResultFeatureSelection(point);
  }
}
