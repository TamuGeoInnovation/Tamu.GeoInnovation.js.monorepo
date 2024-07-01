import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Angulartics2 } from 'angulartics2';

import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';

import { ResidenceHall, ResidenceZones } from '../../../../interfaces/move-in-out.interface';

@Component({
  selector: 'tamu-gisc-zone-select',
  templateUrl: './zone-select.component.html',
  styleUrls: ['./zone-select.component.scss']
})
export class ZoneSelectComponent implements OnInit {
  public savedResidence: ResidenceHall;
  private halls = [];

  public zones: ResidenceZones = {
    southSide: {
      name: 'South Side',
      halls: [
        {
          name: 'Appelt Hall',
          Bldg_Number: ['0293']
        },
        {
          name: 'Aston Hall',
          Bldg_Number: ['0447']
        },
        {
          name: 'Dun Hall',
          Bldg_Number: ['0442']
        },
        {
          name: 'Eppright Hall',
          Bldg_Number: ['0292']
        },
        {
          name: 'Hart Hall',
          Bldg_Number: ['0417']
        },
        {
          name: 'Kreuger Hall',
          Bldg_Number: ['0441']
        },
        {
          name: 'Mosher Hall',
          Bldg_Number: ['0433']
        },
        {
          name: 'Rudder Hall',
          Bldg_Number: ['0291']
        },
        {
          name: 'Underwood Hall',
          Bldg_Number: ['0394']
        },
        {
          name: 'Wells Hall',
          Bldg_Number: ['0290']
        }
      ]
    },
    northSide: {
      name: 'North Side',
      halls: [
        {
          name: 'Clements Hall',
          Bldg_Number: ['0548']
        },
        {
          name: 'Davis-Gary Hall',
          Bldg_Number: ['0415']
        },
        {
          name: 'Fowler Hall',
          Bldg_Number: ['0427']
        },
        {
          name: 'Haas Hall',
          Bldg_Number: ['0549']
        },
        {
          name: 'Hart Hall ',
          Bldg_Number: ['0417']
        },
        {
          name: 'Hobby Hall',
          Bldg_Number: ['0653']
        },
        {
          name: 'Hughes Hall',
          Bldg_Number: ['0426']
        },
        {
          name: 'Hullabaloo Hall',
          Bldg_Number: ['1416']
        },
        {
          name: 'Keathley Hall',
          Bldg_Number: ['0428']
        },
        {
          name: 'Lechner Hall',
          Bldg_Number: ['0294']
        },
        {
          name: 'Legett Hall',
          Bldg_Number: ['0419']
        },
        {
          name: 'McFadden Hall',
          Bldg_Number: ['0550']
        },
        {
          name: 'Moses Hall',
          Bldg_Number: ['0412']
        },
        {
          name: 'Neeley Hall',
          Bldg_Number: ['0652']
        },
        {
          name: 'Schuhmacher Hall',
          Bldg_Number: ['0430']
        },
        {
          name: 'Walton Hall',
          Bldg_Number: ['0430']
        }
      ]
    },
    whiteCreek: {
      name: 'White Creek',
      halls: [
        {
          name: 'White Creek Apartments',
          Bldg_Number: ['1590', '1591', '1592', '0064']
        }
      ]
    }
  };

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
