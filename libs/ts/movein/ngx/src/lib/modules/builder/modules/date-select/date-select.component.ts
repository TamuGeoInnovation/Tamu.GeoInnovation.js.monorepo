import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Angulartics2 } from 'angulartics2';

import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';

@Component({
  selector: 'tamu-gisc-date-select',
  templateUrl: './date-select.component.html',
  styleUrls: ['./date-select.component.scss']
})
export class DateSelectComponent implements OnInit {
  private returnState: string;
  public savedDate: number;

  public dates: Array<MoveDate> = [
    {
      day: 17,
      name: 'Saturday'
    },
    {
      day: 18,
      name: 'Sunday'
    },
    {
      day: 19,
      name: 'Monday'
    },
    {
      day: 20,
      name: 'Tuesday'
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

    this.route.params.subscribe((params) => {
      if (params['returnState']) {
        this.returnState = params['returnState'];
      }
    });
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

      if (this.returnState !== undefined) {
        this.router.navigate([`builder/${this.returnState}`]);
      } else {
        this.router.navigate(['builder/zone']);
      }
    }
  };
}

export interface MoveDate {
  day: number;
  name: string;
}
