import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, from, combineLatest, of, Subject } from 'rxjs';
import { shareReplay, map, filter, switchMap, withLatestFrom, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { IChartConfiguration } from '@tamu-gisc/charts';
import { getRandomNumber } from '@tamu-gisc/common/utils/number';
import { PopupService } from '@tamu-gisc/maps/feature/popup';
import { EsriMapService, HitTestSnapshot, EsriModuleProviderService } from '@tamu-gisc/maps/esri';
import { FeatureHighlightService } from '@tamu-gisc/maps/feature/feature-highlight';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-sidebar-relationships',
  templateUrl: './sidebar-relationships.component.html',
  styleUrls: ['./sidebar-relationships.component.scss'],
  providers: [FeatureHighlightService]
})
export class SidebarRelationshipsComponent implements OnInit, OnDestroy {
  public tier: Observable<number>;
  public nextTier: Observable<number>;
  public previousTier: Observable<number>;

  public tierOwnedBy: Observable<Array<esri.Graphic>>;
  public tierOwns: Observable<Array<esri.Graphic>>;
  public sampleLocationsInZone: Observable<Array<esri.Graphic>>;

  public sample: Observable<number>;

  public affectedBuildings: Observable<Array<IEffluentTierMetadata>>;

  public hit: Observable<HitTestSnapshot>;
  public hitGraphic: Observable<esri.Graphic>;

  private zonesResourceUrl: string;
  private sampleLocationsResourceUrl: string;
  private buildingsResource: Array<IEffluentTierMetadata>;
  private modules: Observable<[esri.QueryConstructor, esri.QueryTaskConstructor]>;
  private _destroy: Subject<boolean> = new Subject();

  public chartOptions: Partial<IChartConfiguration['options']> = {
    scales: {
      xAxes: [
        {
          type: 'time',
          distribution: 'series',
          time: {
            unit: 'day'
          }
        }
      ]
    },
    legend: {
      position: 'bottom',
      display: false
    },
    plugins: {
      colorschemes: {
        scheme: 'brewer.Paired8'
      }
    }
  };

  constructor(
    private mapService: EsriMapService,
    private environmentService: EnvironmentService,
    private popupService: PopupService,
    private moduleProvider: EsriModuleProviderService,
    private featureHighlightService: FeatureHighlightService
  ) {}

  public ngOnInit(): void {
    this.popupService.suppressPopups();

    this.zonesResourceUrl = this.environmentService.value('effluentZonesUrl');
    this.sampleLocationsResourceUrl = this.environmentService.value('effluentSampleLocationsUrl');
    this.buildingsResource = this.environmentService.value('effluentTiers');

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
        return oldGraphic.attributes.FID === newGraphic.attributes.FID;
      })
    );

    this.tier = this.hitGraphic.pipe(
      map((graphic) => {
        return graphic && graphic.attributes && graphic.attributes.Tier !== undefined
          ? parseInt(graphic.attributes.Tier, 10)
          : undefined;
      })
    );

    this.sample = this.hitGraphic.pipe(
      map((graphic) => {
        return graphic && graphic.attributes && graphic.attributes.SampleNumb !== undefined
          ? parseInt(graphic.attributes.SampleNumb.split('-').pop(), 10)
          : undefined;
      })
    );

    this.hitGraphic.pipe(takeUntil(this._destroy)).subscribe((graphic) => {
      this.featureHighlightService.highlight({
        features: graphic,
        options: {
          clearAllOthers: true
        }
      });
    });

    // combineLatest([this.mapService.store, this.hitGraphic])
    //   .pipe(withLatestFrom(this._highlightFeatures))
    //   .subscribe(async ([[store, graphic], highlights]) => {
    //     // Deselect any features
    //     if (highlights) {
    //       highlights.remove();
    //     }

    //     const layerView: esri.FeatureLayerView = ((await store.view.whenLayerView(
    //       graphic.layer
    //     )) as unknown) as esri.FeatureLayerView;

    //     this._highlightFeatures.next(layerView.highlight(graphic));
    //   });

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

    this.modules = from(this.moduleProvider.require(['Query', 'QueryTask'])).pipe(shareReplay(1)) as Observable<
      [esri.QueryConstructor, esri.QueryTaskConstructor]
    >;

    this.tierOwns = combineLatest([this.nextTier, this.hitGraphic, this.modules]).pipe(
      switchMap(([nextTier, graphic, [Query, QueryTask]]) => {
        const task = new QueryTask({ url: this.zonesResourceUrl });

        const q = new Query({
          returnGeometry: true,
          spatialRelationship: 'intersects',
          outFields: ['*'],
          geometry: graphic.geometry,
          where: `Tier = '${nextTier}'`
        });

        return from(task.execute(q));
      }),
      map((result) => {
        return result.features;
      }),
      shareReplay(1)
    );

    this.tierOwnedBy = combineLatest([this.previousTier, this.hitGraphic, this.modules]).pipe(
      switchMap(([previousTier, graphic, [Query, QueryTask]]) => {
        const task = new QueryTask({ url: this.zonesResourceUrl });

        const q = new Query({
          returnGeometry: true,
          spatialRelationship: 'intersects',
          outFields: ['*'],
          geometry: graphic.geometry,
          where: `Tier = '${previousTier}'`
        });

        return from(task.execute(q));
      }),
      map((result) => {
        return result.features;
      }),
      shareReplay(1)
    );

    this.sampleLocationsInZone = combineLatest([this.tier, this.hitGraphic, this.modules]).pipe(
      switchMap(([tier, graphic, [Query, QueryTask]]) => {
        const task = new QueryTask({ url: this.sampleLocationsResourceUrl });

        const q = new Query({
          returnGeometry: true,
          spatialRelationship: 'intersects',
          outFields: ['*'],
          geometry: graphic.geometry,
          where: `Tier = '${tier}'`
        });

        return from(task.execute(q));
      }),
      map((result) => {
        return result.features;
      }),
      map((features) => {
        return features.map((f) => {
          f.attributes.chartData = this.getRandomChartData();
          return f;
        });
      }),
      shareReplay(1)
    );

    this.affectedBuildings = this.sampleLocationsInZone.pipe(
      withLatestFrom(this.tier, this.sample),
      switchMap(([locations, tier, sample]) => {
        const filtered = locations.reduce((acc, curr) => {
          const buildingsForLocation = this.buildingsResource.filter((building) => {
            return building.tiers.some((t) => {
              return t.tier === tier && t.zone === sample;
            });
          });

          const merged = [...acc, ...buildingsForLocation];

          return merged;
        }, []);

        return of(filtered);
      })
    );
  }

  public ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
    this.popupService.enablePopups();
  }

  private getRandomChartData(): Observable<IChartConfiguration['data']> {
    return of({ values: this.getNRandomValues(7), dates: this.getLastNDates(7) }).pipe(
      map((factors) => {
        return factors.dates.map((d, i, a) => {
          return {
            x: d,
            y: factors.values[i]
          };
        });
      }),
      map((dataset) => {
        return {
          datasets: [
            {
              data: dataset,
              fill: false
            }
          ]
        };
      })
    );
  }

  public async highlightSubSample(subSample: string) {
    const layer = this.mapService.findLayerById(`sampling-zone-${subSample.split('-')[0]}`) as esri.FeatureLayer;

    const r = await layer.queryFeatures({
      returnGeometry: true,
      outFields: ['*'],
      where: `SampleNumb = '${subSample}'`
    });

    if (r.features.length > 0) {
      this.featureHighlightService.highlight({
        features: r.features,
        options: {
          clearAllOthers: true
        }
      });
    }
  }

  public async highlightLocation() {}

  public async highlightBuildings(building: string | string[]) {
    const layer = this.mapService.findLayerById(`buildings-layer`) as esri.FeatureLayer;

    const padStart = (number: string) => (number.length < 4 ? number.padStart(4, '0') : number);

    const buildingNumbers = building instanceof Array ? building.map((b) => padStart(b)) : [padStart(building)];

    const r = await layer.queryFeatures({
      returnGeometry: true,
      outFields: ['*'],
      where: `Number LIKE ('${buildingNumbers.join(',')}')`
    });

    if (r.features.length > 0) {
      this.featureHighlightService.highlight({
        features: r.features,
        options: {
          clearAllOthers: true
        }
      });
    }
  }

  private getNRandomValues(n: number) {
    return new Array(n).fill(undefined).map((v) => getRandomNumber(0, 1000));
  }

  private getLastNDates(days: number) {
    return new Array(days)
      .fill(undefined)
      .reduce((acc, curr, ci) => {
        if (ci === 0) {
          return [Date.now()];
        } else {
          return [...acc, acc[ci - 1] - 24 * 60 * 60 * 1000];
        }
      }, [])
      .reverse();
  }
}

export interface IEffluentTierMetadata {
  number: string;
  classification: 'Residence' | 'E&G' | 'Dining';
  area: number;
  tiers: Array<{
    tier: number;
    zone: number;
  }>;
}
