import { Component, OnInit } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { Snapshot } from '@tamu-gisc/cpa/common/entities';
import { LayersService } from '@tamu-gisc/cpa/data-access';

import { ViewerService } from '../../services/viewer.service';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-live-layers-control',
  templateUrl: './live-layers-control.component.html',
  styleUrls: ['./live-layers-control.component.scss']
})
export class LiveLayersControlComponent implements OnInit {
  public layers: Observable<Array<Snapshot>>;

  constructor(private layersService: LayersService, private viewerService: ViewerService, private ms: EsriMapService) {}

  public ngOnInit(): void {
    this.layers = this.viewerService.workshopGuid.pipe(
      switchMap((guid) => {
        return this.layersService.getAvailableLayersForWorkshop(guid);
      })
    );
  }

  public addLiveLayer(snapshot: Snapshot) {
    forkJoin([this.viewerService.workshop.pipe(take(1))])
      .pipe(
        switchMap(([w]) => {
          return this.layersService.getWorkshopSnapshotLayerSource(w.guid, snapshot.guid);
        })
      )
      .subscribe((source: Array<esri.Graphic>) => {
        this.ms.findLayerOrCreateFromSource({
          id: snapshot.guid,
          title: `${snapshot.title} - LL`,
          type: 'feature',
          native: {
            source,
            objectIdField: 'ObjectID'
          }
        });
      });
  }
}
