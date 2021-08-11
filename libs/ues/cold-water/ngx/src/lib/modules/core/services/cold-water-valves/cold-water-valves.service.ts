import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, from, NEVER, of, forkJoin } from 'rxjs';
import { map, pluck, reduce, shareReplay, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { UserService } from '@tamu-gisc/ues/common/ngx';

import { IWhere } from '../../../info/pages/list/list.component';

import esri = __esri;

@Injectable({
  providedIn: 'root'
})
export class ColdWaterValvesService {
  public stats: Observable<Array<esri.StatisticDefinition>>;

  private _selectedValveId: ReplaySubject<number> = new ReplaySubject(1);
  private _extent: esri.Extent;

  public selectedValve: Observable<MappedValve>;

  constructor(private mapService: EsriMapService, private usr: UserService) {
    this.selectedValve = this._selectedValveId.pipe(
      switchMap((id) => {
        return this.getValve(id);
      }),
      shareReplay()
    );
  }

  public getValves(limit?: number, offset?: number, where?: IWhere, returnGeometry?: boolean) {
    return this.getLayerInstance().pipe(
      switchMap((layer) => {
        // Construct the where clause depending on the where and filter clause availability
        const w = `${where.where.length > 0 ? '(' + where.where + ')' : ''} ${
          where.where.length > 0 && where.filter.length > 0 ? 'AND' : ''
        } ${where.filter.length > 0 ? '(' + where.filter + ')' : ''}`;

        const qParams = {
          where: w || '1 = 1',
          outFields: ['*'],
          returnGeometry: returnGeometry || true,
          num: limit || 2000,
          start: offset || 0,
          outSpatialReference: {
            wkid: 102100
          }
        };

        const query = layer.queryFeatures(qParams);

        return from(query);
      }),
      pluck('features')
    );
  }

  public getValveStats(where: IWhere): Observable<IValveStats> {
    return this.getLayerInstance().pipe(
      switchMap((layer) => {
        if (where === undefined) {
          // Query total number of valves
          const ct = layer.queryFeatures({
            where: '1=1',
            outStatistics: [
              {
                statisticType: 'count',
                onStatisticField: 'OBJECTID',
                outStatisticFieldName: 'total_valves'
              }
            ]
          });

          // Query number of valves that are not in normal state
          const nr = layer.queryFeatures({
            where: 'NormalPosition_1 = CurrentPosition_1',
            outStatistics: [
              {
                statisticType: 'count',
                onStatisticField: 'OBJECTID',
                outStatisticFieldName: 'normal_valves'
              }
            ]
          });

          return forkJoin([ct, nr]);
        } else {
          // Make query with where clause represents total valves
          const ct = layer.queryFeatures({
            where: where.where,
            outStatistics: [
              {
                statisticType: 'count',
                onStatisticField: 'OBJECTID',
                outStatisticFieldName: 'total_valves'
              }
            ]
          });

          // Query number of valves that are not in normal state
          const nr = layer.queryFeatures({
            where: `(NormalPosition_1 = CurrentPosition_1) AND (${where.where})`,
            outStatistics: [
              {
                statisticType: 'count',
                onStatisticField: 'OBJECTID',
                outStatisticFieldName: 'normal_valves'
              }
            ]
          });

          return forkJoin([ct, nr]);
        }
      }),
      this.processStats
    );
  }

  private processStats(featureSets: Observable<Array<esri.FeatureSet>>): Observable<IValveStats> {
    return featureSets.pipe(
      // Break up the results into individual featuresets
      switchMap((results) => from(results)),
      // Pluck the inner attributes property from each featureset
      pluck('features', '0', 'attributes'),
      // // Merge both attribute objects
      reduce((acc, curr: { [property: string]: string | number }) => {
        return { ...acc, ...curr };
      }, {}),
      map((stats: { total_valves: number; normal_valves: number }) => {
        const updated = { ...stats, abnormal_valves: stats.total_valves - stats.normal_valves };

        return updated;
      })
    );
  }

  /**
   * Returns a mapped valve object from a valve id.
   */
  public getValve(valveId: string | number): Observable<MappedValve> {
    return this.getValves(1, 0, { where: `OBJECTID = ${valveId}`, filter: '' }).pipe(
      map((results) => {
        const valve = results[0] as MappedValve;

        return valve;
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
      map((results) => {
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
      switchMap((instance) => {
        const l = instance.map.findLayerById('cold-water-valves-layer') as esri.FeatureLayer;

        if (!l) {
          console.warn('Could not find feature layer');
          return NEVER;
        }

        return of(l);
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

export interface IValveStats {
  total_valves: number;
  normal_valves: number;
  abnormal_valves: number;
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
