import { Injectable } from '@angular/core';
import { Observable, combineLatest, from, of } from 'rxjs';
import { shareReplay, map, filter, distinctUntilChanged, switchMap, withLatestFrom, tap } from 'rxjs/operators';

import { EsriMapService, HitTestSnapshot } from '@tamu-gisc/maps/esri';
import { PopupService } from '@tamu-gisc/maps/feature/popup';
import { FeatureHighlightService } from '@tamu-gisc/maps/feature/feature-highlight';

import { SamplingLocationsService } from './sampling-locations.service';
import { SamplingBuildingsService } from './sampling-buildings.service';
import { EffluentZonesService } from './effluent-zones.service';

import esri = __esri;

@Injectable({
  providedIn: 'root'
})
export class EffluentService {
  public tier: Observable<number>;
  public nextTier: Observable<number>;
  public previousTier: Observable<number>;

  public tierOwnedBy: Observable<Array<esri.Graphic>>;
  public tierOwns: Observable<Array<esri.Graphic>>;
  public sampleLocationsInZone: Observable<Array<esri.Graphic>>;
  public sampleBuildings: Observable<Array<esri.Graphic>>;
  public uncoveredBuildings: Observable<Array<esri.Graphic>>;

  public sample: Observable<number>;

  public affectedBuildings: Observable<Array<esri.Graphic>>;

  public hit: Observable<HitTestSnapshot>;
  public hitGraphic: Observable<esri.Graphic>;
  public isHitGraphicZone: Observable<boolean>;

  constructor(
    private mapService: EsriMapService,
    private popupService: PopupService,
    private featureHighlightService: FeatureHighlightService,
    private effluentSampleService: SamplingLocationsService,
    private effluentBuildingsService: SamplingBuildingsService,
    private effluentZonesService: EffluentZonesService
  ) {
    this.popupService.suppressPopups();

    this.popupService.suppressPopups();

    this.hit = this.mapService.hitTest.pipe(shareReplay(1));

    this.hitGraphic = this.mapService.hitTest.pipe(
      map((snapshot) => {
        const [graphic] = snapshot.graphics;
        return graphic;
      }),
      filter((g) => {
        return g !== undefined;
      }),
      // Filter out multiple emissions by feature id. This will prevent many xhr requests and limit other
      // unnecessary UI reactive changes.
      distinctUntilChanged((oldGraphic, newGraphic) => {
        return oldGraphic.attributes.OBJECTID === newGraphic.attributes.OBJECTID;
      })
    );

    this.isHitGraphicZone = this.hitGraphic.pipe(
      map((g) => {
        return g.layer.id !== 'sample-testing-locations';
      }),
      shareReplay(1)
    );

    this.tier = this.hitGraphic.pipe(
      map((graphic) => {
        if (graphic && graphic.attributes && graphic.attributes.Tier !== undefined) {
          return parseInt(graphic.attributes.Tier, 10);
        } else if (graphic && graphic.attributes && graphic.attributes.SampleNumber !== undefined) {
          return parseInt(graphic.attributes.SampleNumber.split('-')[0], 10);
        } else {
          return undefined;
        }
      })
    );

    this.sample = this.hitGraphic.pipe(
      map((graphic) => {
        if (graphic && graphic.attributes && graphic.attributes.SampleNumber !== undefined) {
          return parseInt(graphic.attributes.SampleNumber.split('-').pop(), 10);
        } else if (graphic && graphic.attributes && graphic.attributes.Sample !== undefined) {
          return parseInt(graphic.attributes.Sample.split('-')[1], 10);
        } else {
          return undefined;
        }
      })
    );

    this.previousTier = this.tier.pipe(
      filter((currentTier) => {
        return currentTier !== undefined;
      }),
      map((tier) => {
        if (tier > 1) {
          return tier - 1;
        } else {
          return null;
        }
      })
    );

    this.nextTier = this.tier.pipe(
      filter((currentTier) => {
        return currentTier !== undefined;
      }),
      map((tier) => {
        if (tier < 4) {
          return tier + 1;
        } else {
          return null;
        }
      })
    );

    this.tierOwns = combineLatest([this.nextTier, this.hitGraphic]).pipe(
      switchMap(([nextTier, graphic]) => {
        return this.effluentZonesService.getZonesForTier(graphic.geometry, nextTier);
      }),
      shareReplay(1)
    );

    this.tierOwnedBy = combineLatest([this.previousTier, this.hitGraphic]).pipe(
      switchMap(([previousTier, graphic]) => {
        return this.effluentZonesService.getZonesForTier(graphic.geometry, previousTier);
      }),
      shareReplay(1)
    );

    this.sampleLocationsInZone = combineLatest([this.tier, this.hitGraphic]).pipe(
      switchMap(([tier, graphic]) => {
        return this.effluentSampleService.getSamplingLocationsForTier(graphic.geometry, tier);
      }),
      shareReplay(1)
    );

    this.affectedBuildings = this.sampleLocationsInZone.pipe(
      withLatestFrom(this.tier, this.sample),
      switchMap(([locations, tier, sample]) => {
        const filtered = locations.reduce((acc) => {
          const buildingsForLocation = this.effluentBuildingsService.getBuildingsIn({
            tier: tier,
            zone: sample
          });

          const merged = [...acc, ...buildingsForLocation];

          return merged;
        }, []);

        return of(
          filtered.map((f) => {
            return f.number;
          })
        ).pipe(
          switchMap((bldgs) => {
            return this.getBuildings(bldgs);
          })
        );
      }),
      shareReplay(1)
    );

    this.sampleBuildings = this.affectedBuildings.pipe(
      withLatestFrom(this.isHitGraphicZone, this.tier, this.sample),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      switchMap(([v, is, tier, sample]) => {
        if (is === false) {
          const filtered = this.effluentBuildingsService.getBuildingsIn({
            tier: tier,
            zone: sample
          });

          return of(filtered.map((f) => f.number)).pipe(
            switchMap((bldgs) => {
              return this.getBuildings(bldgs);
            })
          );
        } else {
          return of(undefined);
        }
      }),
      tap((buildings) => {
        if (buildings && buildings.length > 0) {
          this.featureHighlightService.highlight({
            features: buildings,
            options: {
              clearAllOthers: true
            }
          });
        }
      })
    );

    this.uncoveredBuildings = this.affectedBuildings.pipe(
      withLatestFrom(this.tier, this.sample, this.hitGraphic),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      switchMap(([buildings, tier, sample, graphic]) => {
        const bldgs = buildings.map((b) => `'${b.attributes.Number}'`);

        return from(this.getIntersectingNonFocusBuildings(bldgs, graphic));
      }),
      map((result) => {
        return result.features;
      }),
      shareReplay(1)
    );
  }

  public async getIntersectingNonFocusBuildings(buildings: string[], area: esri.Graphic) {
    const layer = this.mapService.findLayerById(`buildings-layer`) as esri.FeatureLayer;

    const r = await layer.queryFeatures({
      returnGeometry: false,
      outFields: ['*'],
      where: `Number NOT IN (${buildings.join(',')})`,
      geometry: area.geometry
    });

    return r;
  }

  public async getBuildings(building: string | string[]): Promise<Array<esri.Graphic>> {
    if (building === undefined || (building instanceof Array && building.length === 0)) {
      return [];
    }

    const layer = this.mapService.findLayerById(`buildings-layer`) as esri.FeatureLayer;

    const padStart = (number: string) => (number.length < 4 ? `'${number.padStart(4, '0')}'` : `'${number}'`);

    const buildingNumbers = building instanceof Array ? building.map((b) => padStart(b)) : [padStart(building)];

    const r = await layer.queryFeatures({
      returnGeometry: true,
      outFields: ['*'],
      where: `Number IN (${buildingNumbers.join(',')})`
    });

    return r.features;
  }
}
