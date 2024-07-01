import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Angulartics2 } from 'angulartics2';

import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';

@Component({
  selector: 'tamu-gisc-accommodations',
  templateUrl: './accommodations.component.html',
  styleUrls: ['./accommodations.component.scss']
})
export class AccommodationsComponent implements OnInit {
  private returnState: string;
  public savedAccessible: boolean;

  constructor(
    private store: LocalStoreService,
    private router: Router,
    private route: ActivatedRoute,
    private angulartics: Angulartics2
  ) {}

  public ngOnInit() {
    this.savedAccessible = this.store.getStorageObjectKeyValue({ primaryKey: 'aggiemap-movein', subKey: 'accessible' });

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
  public saveAccessible = (item: boolean): void => {
    this.store.setStorageObjectKeyValue({
      primaryKey: 'aggiemap-movein',
      subKey: 'accessible',
      value: item
    });

    const confirm = this.store.getStorageObjectKeyValue({
      primaryKey: 'aggiemap-movein',
      subKey: 'accessible'
    });

    this.angulartics.eventTrack.next({
      action: 'Accommodation Selection',
      properties: {
        category: 'UI Interaction',
        label: confirm
      }
    });

    if (this.returnState !== undefined) {
      this.router.navigate([`builder/${this.returnState}`]);
    } else {
      this.router.navigate(['builder/review']);
    }
  };
}
