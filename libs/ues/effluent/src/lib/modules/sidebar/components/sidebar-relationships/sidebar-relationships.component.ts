import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { IChartConfiguration } from '@tamu-gisc/charts';
import { PopupService } from '@tamu-gisc/maps/feature/popup';
import { EsriMapService } from '@tamu-gisc/maps/esri';
import { FeatureHighlightService } from '@tamu-gisc/maps/feature/feature-highlight';

import { EffluentService } from '../../../core/services/effluent.service';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-sidebar-relationships',
  templateUrl: './sidebar-relationships.component.html',
  styleUrls: ['./sidebar-relationships.component.scss'],
  providers: [FeatureHighlightService, EffluentService]
})
export class SidebarRelationshipsComponent implements OnInit, OnDestroy {
  public tier = this.effluentService.tier;
  public nextTier = this.effluentService.nextTier;
  public previousTier = this.effluentService.previousTier;

  public tierOwnedBy = this.effluentService.tierOwnedBy;
  public tierOwns = this.effluentService.tierOwns;
  public sampleLocationsInZone = this.effluentService.sampleLocationsInZone;
  public sampleBuildings = this.effluentService.sampleBuildings;

  public sample = this.effluentService.sample;

  public affectedBuildings = this.effluentService.affectedBuildings;
  public uncoveredBuildings = this.effluentService.uncoveredBuildings;

  public hit = this.effluentService.hit;
  public hitGraphic = this.effluentService.hitGraphic;
  public isHitGraphicZone = this.effluentService.isHitGraphicZone;

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
    private popupService: PopupService,
    private featureHighlightService: FeatureHighlightService,
    private effluentService: EffluentService
  ) {}

  public ngOnInit(): void {
    this.popupService.suppressPopups();

    this.hitGraphic.pipe(takeUntil(this._destroy)).subscribe((graphic) => {
      this.featureHighlightService.highlight({
        features: graphic,
        options: {
          clearAllOthers: true
        }
      });
    });
  }

  public ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
    this.popupService.enablePopups();
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

  public async highlightBuildings(building: string | string[]) {
    const buildings = await this.effluentService.getBuildings(building);

    if (building.length > 0) {
      this.featureHighlightService.highlight({
        features: buildings,
        options: {
          clearAllOthers: true
        }
      });
    }
  }
}
