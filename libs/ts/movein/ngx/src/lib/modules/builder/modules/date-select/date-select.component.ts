import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Angulartics2 } from 'angulartics2';

import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';

import { MoveDate } from '../../../../interfaces/move-in-out.interface';

@Component({
  selector: 'tamu-gisc-date-select',
  templateUrl: './date-select.component.html',
  styleUrls: ['./date-select.component.scss']
})
export class DateSelectComponent implements OnInit {
  public savedDate: number;

  public dates: Array<MoveDate> = [
    {
      day: 15,
      name: 'Thursday'
    },
    {
      day: 16,
      name: 'Friday'
    },
    {
      day: 17,
      name: 'Saturday'
    },
    {
      day: 18,
      name: 'Sunday'
    }
  ];

  constructor(
    private store: LocalStoreService,
    private router: Router,
    private route: ActivatedRoute,
    private angulartics: Angulartics2
  ) {}

  public ngOnInit() {
    // Load saved value from local storage
    this.savedDate = this.store.getStorageObjectKeyValue<number>({ subKey: 'date', primaryKey: 'aggiemap-movein' });
  }

  /**
   * Saves component value in local storage
   *
   * @param {*} item
   */
  public saveDate = (item: MoveDate) => {
    this.store.setStorageObjectKeyValue({
      primaryKey: 'aggiemap-movein',
      subKey: 'date',
      value: item.day
    });

    // Verify that the value store was successful.
    const confirm = this.store.getStorageObjectKeyValue<number>({
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
