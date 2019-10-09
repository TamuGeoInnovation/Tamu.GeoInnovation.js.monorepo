import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { from, Subject, combineLatest } from 'rxjs';
import { takeUntil, pluck } from 'rxjs/operators';

import { LayerListService } from '@tamu-gisc/maps/feature/layer-list';
import { EsriModuleProviderService, EsriMapService, MapServiceInstance } from '@tamu-gisc/maps/esri';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-map-draw',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss']
})
export class BaseComponent implements OnInit, OnDestroy {
  public model: esri.SketchViewModel;

  @Input()
  private reference: string;

  private $destroy: Subject<boolean> = new Subject();
  private $loaded: Subject<boolean> = new Subject();

  constructor(
    private moduleProvider: EsriModuleProviderService,
    private mapService: EsriMapService,
    private layerListService: LayerListService
  ) {}

  public ngOnInit() {
    if (this.reference !== undefined) {
      combineLatest([
        from(this.moduleProvider.require(['SketchViewModel'])),
        this.mapService.store,
        // Only interested in the first emission that has a valid layer instance.
        // Once $loaded emits, this observable will unsubscribe so that the combineLatest
        // stream does not emit and create additional view model instances.
        this.layerListService.layers({ layers: this.reference }).pipe(
          takeUntil(this.$loaded),
          pluck('0', 'layer')
        )
      ])
        // Since we
        .pipe(takeUntil(this.$destroy))
        .subscribe(
          ([[SketchViewModel], mapInstance, layer]: [[esri.SketchViewModelConstructor], MapServiceInstance, esri.Layer]) => {
            // Emit $loaded which functions as a scheduler on the layer list service to prevent
            // the layer reference stream from emitting again, which would in turn force the
            // combineLatest stream to emit and create additional view models.
            this.$loaded.next();
            this.model = new SketchViewModel({ view: mapInstance.view, layer });
          }
        );
    } else {
      throw new Error('Drawing reference layer not provided.');
    }
  }

  public ngOnDestroy() {
    this.$destroy.next();
    this.$destroy.complete();
  }

  public create(tool: string) {
    this.model.create(tool);
  }
}
