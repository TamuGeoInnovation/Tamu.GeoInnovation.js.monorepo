import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Angulartics2 } from 'angulartics2';

import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';

import { ResidenceHall, ResidenceZones } from '../../../../interfaces/move-in-out.interface';
import { RESIDENCES } from '../../../../dictionaries/move-in-out.dictionary';

@Component({
  selector: 'tamu-gisc-zone-select',
  templateUrl: './zone-select.component.html',
  styleUrls: ['./zone-select.component.scss']
})
export class ZoneSelectComponent implements OnInit {
  public savedResidence: ResidenceHall;
  private halls = [];

  public zones: ResidenceZones = RESIDENCES;

  constructor(
    private store: LocalStoreService,
    private router: Router,
    private route: ActivatedRoute,
    private angulartics: Angulartics2
  ) {}

  public ngOnInit() {
    // Load saved value from local storage
    this.savedResidence = this.store.getStorageObjectKeyValue({
      primaryKey: 'aggiemap-movein',
      subKey: 'residence'
    });
  }

  /**
   * Saves component value in local storage
   *
   * @param {*} item
   */
  public saveResidence = (item: ResidenceHall): void => {
    // Iterate through residence hall zones and find the zone that includes the provided residence hall.
    // This is used to determine which zone the residence hall belongs to.
    const zone = Object.keys(this.zones).find((key) => {
      return this.zones[key].halls.find((hall) => {
        return hall.name === item.name;
      });
    });

    if (zone !== undefined) {
      // Append zone to the residence. Used to render map elements based on region
      item.zone = this.zones[zone].name;

      this.store.setStorageObjectKeyValue({
        primaryKey: 'aggiemap-movein',
        subKey: 'residence',
        value: item
      });

      // Verify that the value store was successful.
      const confirm = this.store.getStorageObjectKeyValue<ResidenceHall>({
        primaryKey: 'aggiemap-movein',
        subKey: 'residence'
      });

      if (confirm != undefined) {
        this.angulartics.eventTrack.next({
          action: 'Hall Select',
          properties: {
            category: 'UI Interaction',
            label: confirm.name
          }
        });

        this.savedResidence = confirm;

        const hasRet = this.route.snapshot.queryParams['ret'];

        if (hasRet !== undefined) {
          this.router.navigate([`builder/${hasRet}`]);
        } else {
          this.router.navigate(['builder/accommodations']);
        }
      }
    } else {
      console.error('Zone not found for hall ', item.name);
    }
  };
}
