import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { from, Subject, combineLatest } from 'rxjs';
import { takeUntil, pluck, filter, switchMap, take } from 'rxjs/operators';

import { LayerListService } from '@tamu-gisc/maps/feature/layer-list';
import { EsriModuleProviderService, EsriMapService, MapServiceInstance } from '@tamu-gisc/maps/esri';
import { FeatureSelectorService } from '@tamu-gisc/maps/feature/feature-selector';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-map-draw',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss'],
  providers: [FeatureSelectorService]
})
export class BaseComponent implements OnInit, OnDestroy {
  public model: esri.SketchViewModel;

  @Input()
  public reference: string;

  @Input()
  public allowedTools: string[];

  @Input()
  public defaultUpdateTool: string;

  public activeUpdateTool: string;

  private _$destroy: Subject<boolean> = new Subject();
  private _$loaded: Subject<boolean> = new Subject();
  private _activeToolWatchHandle: esri.WatchHandle;

  constructor(
    private moduleProvider: EsriModuleProviderService,
    private mapService: EsriMapService,
    private layerListService: LayerListService,
    private selector: FeatureSelectorService
  ) {}

  public ngOnInit() {
    this.activeUpdateTool = this.defaultUpdateTool;

    if (this.reference !== undefined) {
      combineLatest([
        from(this.moduleProvider.require(['SketchViewModel'])),
        this.mapService.store,
        // Only interested in the first emission that has a valid layer instance.
        // Once $loaded emits, this observable will unsubscribe so that the combineLatest
        // stream does not emit and create additional view model instances.
        this.layerListService.layers({ layers: this.reference }).pipe(
          takeUntil(this._$loaded),
          pluck('0', 'layer')
        )
      ])
        .pipe(takeUntil(this._$destroy))
        .subscribe(
          ([[SketchViewModel], mapInstance, layer]: [[esri.SketchViewModelConstructor], MapServiceInstance, esri.Layer]) => {
            // Emit $loaded which functions as a scheduler on the layer list service to prevent
            // the layer reference stream from emitting again, which would in turn force the
            // combineLatest stream to emit and create additional view models.
            this._$loaded.next();
            this.model = new SketchViewModel({ view: mapInstance.view, layer, updateOnGraphicClick: false });

            this.model.on('update', (event) => {
              this.activeUpdateTool = event.tool;
            });

            this._activeToolWatchHandle = this.model.watch('activeTool', (v) => {
              if (v === null) {
                this.activeUpdateTool = this.defaultUpdateTool;
              } else {
                this.activeUpdateTool = v;
              }
            });
          }
        );

      this.selector.feature
        .pipe(
          switchMap((graphics) => from(graphics)),
          filter((graphic) => Boolean(graphic.layer) && graphic.layer.id === this.reference),
          takeUntil(this._$destroy)
        )
        .subscribe((res) => {
          // Only start the update process if the sketch model is not currently in the middle of another
          // operation.
          if (this.model.state !== 'active') {
            this.model.update(res, { tool: this.activeUpdateTool });
          }
        });
    } else {
      throw new Error('Drawing reference layer not provided.');
    }
  }

  public ngOnDestroy() {
    this._$destroy.next();
    this._$destroy.complete();

    // Possible for the watch handle to not exist on component destroy.
    // Calling undefined method will throw error if that's the case.
    if (Boolean(this._activeToolWatchHandle)) {
      this._activeToolWatchHandle.remove();
    }
  }

  /**
   * Calls the model graphic create method with the provided tool name.
   */
  public create(tool: string) {
    this.activeUpdateTool = undefined;

    this.model.create(tool);
  }

  /**
   * Sets the draw component update tool.
   *
   * If the model is active and the active tool is one of the the two update tools,
   * the update tool will be toggled. This is used in cases where a graphic is already
   * selected and the user wants to switch between update tools (transform <=> reshape).
   *
   * If the model is not actively updating a feature, simply set the tool which will be used
   * at the time of executing the model update method. This is used in the case where the user
   * wants to pre-select an update tool.
   *
   * Additionally, if the model is active from another tool that is not an update tool (point, polygon, etc),
   * cancel that action.
   */
  public setUpdateTool(tool: string) {
    if (this.model.activeTool === 'reshape' || this.model.activeTool === 'transform') {
      (<any>this.model).toggleUpdateTool();
    } else {
      this.activeUpdateTool = tool;

      if (this.model.state === 'active') {
        this.model.cancel();
      }
    }
  }
}
