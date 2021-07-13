import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, from } from 'rxjs';
import { filter, map, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';

import { EsriMapService } from '@tamu-gisc/maps/esri';

import esri = __esri;
import { UserService } from '@tamu-gisc/ues/common/ngx';

@Injectable({
  providedIn: 'root'
})
export class ColdWaterValvesService {
  private _valves: ReplaySubject<Array<MappedValve>> = new ReplaySubject();
  public valves = this._valves.asObservable();

  private _selectedValveId: ReplaySubject<number> = new ReplaySubject(1);
  private _extent: esri.Extent;

  public selectedValve: Observable<MappedValve>;

  constructor(private mapService: EsriMapService, private usr: UserService) {
    this.getDefaultValves();

    this.selectedValve = this._selectedValveId.pipe(
      switchMap((id) => {
        return this.getValve(id);
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

  /**
   * Returns a mapped valve object from a valve id.
   */
  public getValve(valveId: string | number): Observable<MappedValve> {
    return this.getLayerInstance().pipe(
      filter((l) => {
        return l !== undefined;
      }),
      switchMap((l) => {
        const q = l.queryFeatures({
          where: `OBJECTID = ${valveId}`,
          outFields: ['*'],
          returnGeometry: true,
          outSpatialReference: {
            wkid: 102100
          }
        });

        return from(q);
      }),
      map((results) => {
        const valve = results.features[0];

        return valve as MappedValve;
      })
    );
  }

  public updateValveState(valve: MappedValve, state: string | IValvePositionState): Observable<IFeatureLayerEditResults> {
    return this.getLayerInstance().pipe(
      withLatestFrom(this.usr.user),
      switchMap(([layer, user]) => {
        const cloned = valve.clone() as MappedValve;

        cloned.attributes.last_edited_user = user.name;

        cloned.attributes.CurrentPosition_1 = state as IValvePositionState;

        return from(
          layer.applyEdits({
            updateFeatures: [cloned]
          }) as Promise<IFeatureLayerEditResults>
        ).pipe(
          tap((results) => {
            layer.refresh();
          })
        );
      }),
      withLatestFrom(this._valves),
      tap(([results, valves]) => {
        const clonedValves = valves.map((v) => v.clone());

        const valveBeingUpdated = clonedValves.find(
          (v) => v.attributes.OBJECTID === valve.attributes.OBJECTID
        ) as MappedValve;

        valveBeingUpdated.setAttribute('CurrentPosition_1', state);

        this._valves.next(clonedValves);
      }),
      map(([results, valves]) => {
        return results;
      })
    );
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

  private getLayerInstance() {
    return this.mapService.store.pipe(
      take(1),
      switchMap((instance) => {
        return from(instance.view.when() as Promise<esri.View>).pipe(switchMap((view) => this.mapService.store));
      }),
      map((instance) => {
        const l = instance.map.findLayerById('cold-water-valves-layer') as esri.FeatureLayer;

        return l;
      })
    );
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

export interface IFeatureLayerEditResults {
  addAttachmentResults: Array<esri.FeatureEditResult>;
  addFeatureResults: Array<esri.FeatureEditResult>;
  deleteAttachmentResults: Array<esri.FeatureEditResult>;
  deleteFeatureResults: Array<esri.FeatureEditResult>;
  updateAttachmentResults: Array<esri.FeatureEditResult>;
  updateFeatureResults: Array<esri.FeatureEditResult>;
}
