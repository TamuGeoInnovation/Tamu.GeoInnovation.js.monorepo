import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { EsriMapService } from '@tamu-gisc/maps/esri';

import esri = __esri;

@Injectable({
  providedIn: 'root'
})
export class ColdWaterValvesService {
  private _valves: BehaviorSubject<Array<MappedValve>> = new BehaviorSubject(undefined);
  public valves = this._valves.asObservable();

  constructor(private mapService: EsriMapService) {
    this.getDefaultValves();
  }

  private getDefaultValves() {
    this.mapService.store.subscribe((instance) => {
      instance.view.when(() => {
        const l = instance.map.findLayerById('cold-water-valves-layer') as esri.FeatureLayer;

        if (l) {
          const q = l.queryFeatures({
            where: '1 = 1',
            outFields: ['*'],
            returnGeometry: true
          });

          q.then((features) => {
            this._valves.next(this.addValveState(features.features));
          });
        } else {
          console.warn('Unable to load requested layer.');
        }
      });
    });
  }

  public updateValveState(valve: MappedValve): void {
    const valves = this._valves.value.map((v) => v.clone());

    const updating = valves.find((v) => v.attributes.OBJECTID === valve.attributes.OBJECTID) as MappedValve;

    if (updating.attributes.State === 'closed') {
      updating.setAttribute('State', 'open');
    } else {
      updating.setAttribute('State', 'closed');
    }

    this._valves.next(valves);
  }

  private addValveState(valves: Array<Valve>): Array<MappedValve> {
    return valves.map((v) => {
      v.setAttribute('State', 'closed');
      return v as MappedValve;
    });
  }
}

interface Valve extends esri.Graphic {
  attributes: {
    OBJECTID: number;
    Color: number;
    Linetype: string;
    LineWt: string;
    RefName: string;
    Shape_Leng: number;
    Status: string;
    Name: string;
    Material: string;
    Line_Size: string;
    created_user: string;
    created_date: string;
    last_edited_user: string;
    last_edited_date: number;
    test_jzhou: string;
    YearInstalled: number;
    Project_Info: string;
    UpdateNeeded: string;
    Owner: string;
    Condition: string;
    GPS_DATE: number;
  };
}

export interface MappedValve extends Valve {
  attributes: Valve['attributes'] & { State: 'closed' | 'open' };
}
