import { Component, computed, input } from '@angular/core';

import { InternalDiscoverApplication } from '../../interfaces/discover-application.interface';
import { MapColumnGroup } from '../discover.utils';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'tamu-gisc-aggiemap-map-columns',
  templateUrl: './map-columns.component.html',
  styleUrls: ['./map-columns.component.scss'],
  imports: [RouterLink]
})
export class MapColumnsComponent {
  public readonly columns = input<MapColumnGroup[]>([]);
  public readonly noMapsMessage = input('No maps available.');
  public readonly getApplicationRoute = input<(app: InternalDiscoverApplication) => string[]>(() => []);

  /**
   * Whether these columns are a layout split rather than real sections (#2681).
   *
   * A split exists only to use horizontal space, so its order has to read the way a person reads -
   * across each row. Rendering it as three separate lists reads *down* each column instead, which is
   * how an alphabetically sorted list of campuses arrived on screen as DC, HSC College of Dentistry,
   * HSC Round Rock. The sort was right the whole time; the arrangement was not.
   *
   * So a split becomes one list in a grid that flows across, and one DOM order is then correct at
   * every width - including a phone, where it collapses to a single column. Dealing the items
   * round-robin into three lists would have fixed the desktop and scrambled the phone, where the
   * columns stack.
   *
   * A titled column is a real section with a heading that gives it meaning, and keeps its own list.
   */
  public readonly isLayoutSplit = computed(() => {
    const columns = this.columns();

    return columns.length > 0 && columns.every((column) => !column.heading);
  });

  /** Every application of a layout split, in the one order that is read at every width (#2681). */
  public readonly splitApplications = computed(() => this.columns().flatMap((column) => column.applications));
}
