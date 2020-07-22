import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, from, combineLatest, of } from 'rxjs';
import { shareReplay, map, filter, switchMap, withLatestFrom } from 'rxjs/operators';

import { PopupService } from '@tamu-gisc/maps/feature/popup';
import { EsriMapService, HitTestSnapshot, EsriModuleProviderService } from '@tamu-gisc/maps/esri';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-sidebar-relationships',
  templateUrl: './sidebar-relationships.component.html',
  styleUrls: ['./sidebar-relationships.component.scss']
})
export class SidebarRelationshipsComponent implements OnInit, OnDestroy {
  public tier: Observable<number>;
  public nextTier: Observable<number>;
  public previousTier: Observable<number>;

  public tierOwnedBy: Observable<Array<esri.Graphic>>;
  public tierOwns: Observable<Array<esri.Graphic>>;
  public sampleLocationsInZone: Observable<Array<esri.Graphic>>;

  public sample: Observable<number>;

  public affectedBuildings: Observable<Array<IEffluentTierMetatada>>;

  public hit: Observable<HitTestSnapshot>;
  public hitGraphic: Observable<esri.Graphic>;

  private zonesResourceUrl: string;
  private sampleLocationsResourceUrl: string;
  private buildingsResource: Array<IEffluentTierMetatada>;
  private modules: Observable<[esri.QueryConstructor, esri.QueryTaskConstructor]>;

  constructor(
    private mapService: EsriMapService,
    private environmentService: EnvironmentService,
    private popupService: PopupService,
    private moduleProvider: EsriModuleProviderService
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
      })
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
      })
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
      })
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
    this.popupService.enablePopups();
  }
}

export interface IEffluentTierMetatada {
  number: string;
  classification: 'Residence' | 'E&G' | 'Dining';
  area: number;
  tiers: Array<{
    tier: number;
    zone: number;
  }>;
}
