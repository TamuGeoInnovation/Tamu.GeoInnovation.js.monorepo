import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, ReplaySubject } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

import { EsriMapService } from '@tamu-gisc/maps/esri';

import esri = __esri;

@Injectable({
  providedIn: 'root'
})
export class ColdWaterValvesService {
  private _valves: ReplaySubject<Array<MappedValve>> = new ReplaySubject();
  public valves = this._valves.asObservable();

  private _selectedValveId: BehaviorSubject<number> = new BehaviorSubject(undefined);
  private _extent: esri.Extent;

  public selectedValve: Observable<MappedValve>;

  constructor(private mapService: EsriMapService) {
    this.getDefaultValves();

    this.selectedValve = combineLatest([this.valves, this._selectedValveId]).pipe(
      filter(([valves, value]) => {
        return valves !== undefined;
      }),
      map(([valves, id]) => {
        return valves.find((v) => v.attributes.OBJECTID === id);
      })
    );
  }

  private getDefaultValves() {
    this.mapService.store.subscribe((instance) => {
      instance.view.when(() => {
        const l = instance.map.findLayerById('cold-water-valves-layer') as esri.FeatureLayer;

        if (l) {
          const q = l.queryFeatures({
            where: '1 = 1',
            outFields: ['*'],
            returnGeometry: true,
            maxRecordCountFactor: 5,
            outSpatialReference: {
              wkid: 102100
            }
          });

          q.then((valves) => {
            this._valves.next(valves.features as Array<MappedValve>);
          });
        } else {
          console.warn('Unable to load requested layer.');
        }
      });
    });
  }

  public updateValveState(valve: MappedValve): void {
    this._valves.pipe(take(1)).subscribe((stateValves) => {
      const valves = stateValves.map((v) => v.clone());

      const updating = valves.find((v) => v.attributes.OBJECTID === valve.attributes.OBJECTID) as MappedValve;

      if (updating.attributes.CurrentPosition_1 === 'Closed') {
        updating.setAttribute('CurrentPosition_1', 'Open');
      } else {
        updating.setAttribute('CurrentPosition_1', 'Closed');
      }

      this._valves.next(valves);
    });
  }

  public setSelectedValve(valveId: number | string): void {
    let id;
    if (typeof valveId === 'string') {
      id = parseInt(valveId, 10);
    } else {
      id = valveId;
    }

    this._selectedValveId.next(id);
  }

  public clearSelectedValve(): void {
    this._selectedValveId.next(undefined);
  }

  public cacheMapExtent() {
    this.mapService.store.pipe(take(1)).subscribe((instance) => {
      this._extent = instance.view.extent;
    });
  }

  public restoreMapExtent() {
    if (this._extent !== undefined) {
      this.mapService.store.pipe(take(1)).subscribe((instance) => {
        instance.view.goTo(this._extent);
      });
    }
  }

  public toggleColdWaterLines() {
    const layer = this.mapService.findLayerById('cold-water-layer');

    if (layer) {
      layer.visible = !layer.visible;
    }
  }
}

type IValvePositionState = null | 'Open' | 'Closed';

export interface IValve extends esri.Graphic {
  attributes: {
    OBJECTID: number;
    Number: string;
    Type: string;
    Date_Installed: string;
    Elevation: string;
    created_user: string;
    created_date: string;
    last_edited_user: string;
    last_edited_date: number;
    YearInstalled: string;
    Status: string;
    Diameter: string;
    ValveLocation: string;
    NormalPosition: IValvePositionState;
    CurrentPosition: IValvePositionState;
    KeyType: string;
    SurfaceType: number;
    TurnDirection: string;
    ValveType: string;
    LineType: string;
    TurnsToClose: number;
    Surveyed: string;
    LastInspection: string;
    Condition: string;
    Cost: number;
    ReplacementCost: number;
    Manufacturer: string;
    Model: string;
    SerialNumber: string;
    ProjectInfo: string;
    LocationDescription: string;
    GPS_DATE: string;
    ELEVATION_SURVEYED: number;
    VALVE_ID: string;
    OPERABLE: number;
    created_user_1: string;
    created_date_1: string;
    SurveyDate: number;
    InspectName: string;
    PtNumber: string;
    GridLoc: string;
    SystemType: string;
    Turns: string;
    VFeedType: string;
    FeedTypeOther: string;
    VKeyType: string;
    KeyTypeOther: string;
    LeftRight: string;
    ValveLoc: string;
    ValveLocOther: string;
    LocDescription: string;
    VOpenClosed: string;
    Vman: string;
    Vmodel: string;
    VSN: string;
    Vobstructions: string;
    Pinsulation: string;
    CondInsulation: string;
    ValveBXCond: string;
    Voperation: string;
    AddComments: string;
    NeedsWrk: string;
    NormalPosition_1: IValvePositionState;
    CurrentPosition_1: IValvePositionState;
    RepairMade: string;
    DateRepaired: number;
    RepairPerson: string;
    RepairNotes: string;
    RepairType: string;
    RepairTypeDone: string;
    RepairCategoryPlan: string;
    ValveSize_1: string;
  };
}

export interface MappedValve extends IValve {
  attributes: IValve['attributes'];
}
