import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Angulartics2 } from 'angulartics2';

import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';

import { MoveDates } from '../../../../interfaces/move-in-out.interface';
import { MoveinOutServiceService } from '../../../map/services/move-in-out-service.service';

@Component({
  selector: 'tamu-gisc-date-select',
  templateUrl: './date-select.component.html',
  styleUrls: ['./date-select.component.scss']
})
export class DateSelectComponent implements OnInit {
  public dates: MoveDates;
  public timestampedDates: Array<Date>;
  public savedDate: string;

  constructor(
    private readonly store: LocalStoreService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly angulartics: Angulartics2,
    private readonly movein: MoveinOutServiceService
  ) {}

  public ngOnInit() {
    this.dates = this.movein.days;

    // Load saved value from local storage
    this.savedDate = this.store
      .getStorageObjectKeyValue<number>({ subKey: 'date', primaryKey: 'aggiemap-movein' })
      .toString();

    // Convert dates objects using day and month properties to Date objects. These will be used in template with date pipe.
    this.timestampedDates = this.dates.in.map((d) => new Date(new Date().getFullYear(), d.month - 1, d.day));
  }

  /**
   * Saves component value in local storage
   *
   * @param {*} item
   */
  public saveDate = (item: Date) => {
    this.store.setStorageObjectKeyValue({
      primaryKey: 'aggiemap-movein',
      subKey: 'date',
      value: item.getDate()
    });

    // Verify that the value store was successful.
    const confirm = this.store.getStorageObjectKeyValue<string>({
      primaryKey: 'aggiemap-movein',
      subKey: 'date'
    });

    if (confirm != undefined) {
      this.angulartics.eventTrack.next({
        action: 'Date Select',
        properties: {
          category: 'UI Interaction',
          label: confirm
        }
      });

      this.savedDate = confirm;

      const hasRet = this.route.snapshot.queryParams['ret'];

      if (hasRet !== undefined) {
        this.router.navigate([`builder/${hasRet}`]);
      } else {
        this.router.navigate(['builder/zone']);
      }
    }
  };
}
