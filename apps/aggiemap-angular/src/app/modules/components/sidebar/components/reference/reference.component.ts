import { Component } from '@angular/core';

import { AltSearchHelper } from '../../../../helper/alt-search.service';
import { TripPoint } from '@tamu-gisc/maps/feature/trip-planner';
import { ISearchSelection } from '@tamu-gisc/search';

/**
 * Desktop sidebar component that displays the main search component as well as layer list and legend.
 */
@Component({
  selector: 'app-reference',
  templateUrl: './reference.component.html',
  styleUrls: ['./reference.component.scss'],
  providers: [AltSearchHelper]
})
export class ReferenceComponent<T extends object> {
  constructor(private helper: AltSearchHelper<T>) {}

  public onSearchResult(result: ISearchSelection<T>) {
    this.helper.handleSearchResultFeatureSelection(result);
  }
}
