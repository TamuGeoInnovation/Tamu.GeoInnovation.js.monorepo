import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { FeatureHighlightService } from '@tamu-gisc/maps/feature/feature-highlight';

import esri = __esri;
@Component({
  selector: 'tamu-gisc-zone-overview-tile',
  templateUrl: './zone-overview-tile.component.html',
  styleUrls: ['./zone-overview-tile.component.scss']
})
export class ZoneOverviewTileComponent implements OnInit {
  @Input()
  public zone: __esri.Graphic;

  @Output()
  public touched: EventEmitter<boolean> = new EventEmitter();

  public tier: number;

  public sample: number;

  private _toggled: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public toggled: Observable<boolean> = this._toggled.asObservable();

  constructor(private ms: EsriMapService, private hs: FeatureHighlightService) {}

  public ngOnInit(): void {
    this.tier = parseInt(this.zone.attributes.SampleNumber.split('-')[0], 10);
    this.sample = parseInt(this.zone.attributes.SampleNumber.split('-')[1], 10);
  }

  public handleToggle() {
    this.touched.emit();

    this._toggled.next(!this._toggled.getValue());

    this.handleZoneHighlight();
  }

  public async handleZoneHighlight() {
    if (this._toggled.getValue()) {
      const layer = this.ms.findLayerById('sampling-zone-3') as esri.FeatureLayer;

      if (layer) {
        const featureSet = await layer.queryFeatures({
          where: `SampleNumber = '${this.zone.attributes.SampleNumber}'`,
          outFields: ['*'],
          returnGeometry: true,
          outSpatialReference: {
            wkid: 4326
          }
        });

        if (featureSet.features.length > 0) {
          this.hs.highlight({
            features: featureSet.features,
            options: {
              clearAllOthers: true
            }
          });

          const z = await this.ms.computeZoomLevel(featureSet.features);

          this.ms.zoomTo({ graphics: featureSet.features, zoom: z - 1 });
        } else {
          console.warn(`No feature with SampleNumber ${this.tier}-${this.sample} was found.`);
        }
      } else {
        throw new Error('Could not highlight feature because of invalid layer reference');
      }
    } else {
      this.hs.clearAll();
    }
  }
}
