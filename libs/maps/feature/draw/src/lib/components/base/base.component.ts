import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
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
  public model: ISketchViewModel;

  @Input()
  public reference: string;

  @Input()
  public defaultUpdateTool = 'transform';

  public activeUpdateTool: string;

  /**
   * Describes the emission format for the drawn features. By default (`false`) the component
   * will emit individual graphics for each feature.
   *
   * If `true` is provided, the component is limited to exporting only a single type of geometry,
   * due to the single-geometry type limitation per graphic.
   */
  @Input()
  public collapseGraphics: false;

  // Update group/tools default rendering states

  @Input()
  public updateTools = true;

  @Input()
  public transformTool = true;

  @Input()
  public reshapeTool = true;

  // Create group/tools  default rendering states

  @Input()
  public createTools = true;

  @Input()
  public pointTool = true;

  @Input()
  public polylineTool = true;

  @Input()
  public polygonTool = true;

  @Input()
  public rectangleTool = true;

  @Input()
  public circleTool = true;

  // Verion group/tools  default rendering states

  @Input()
  public versionTools = true;

  @Input()
  public undoTool = true;

  @Input()
  public redoTool = true;

  @Output()
  public export: EventEmitter<esri.Graphic[] | esri.Graphic> = new EventEmitter();

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

            this.model = new SketchViewModel({ view: mapInstance.view, layer, updateOnGraphicClick: !this.updateTools });

            this.model.on('create', (event) => {
              if (event.state === 'complete') {
                this.emitDrawn(event.target.layer.graphics);
              }
            });

            this.model.on('update', (event) => {
              if (event.state === 'complete') {
                this.emitDrawn(event.target.layer.graphics);
              }
            });

            this._activeToolWatchHandle = this.model.watch('activeTool', (tool) => {
              if (tool === null) {
                this.activeUpdateTool = this.defaultUpdateTool;
              } else {
                this.activeUpdateTool = tool;
              }
            });
          }
        );

      // If our update tools are disabled, default to the default model updating implementation.
      if (this.updateTools) {
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
      }
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
      this.model.toggleUpdateTool();
    } else {
      this.activeUpdateTool = tool;

      if (this.model.state === 'active') {
        this.model.cancel();
      }
    }
  }

  /**
   * Handles undo/redo actions.
   */
  public versionAction(action: string) {
    if (Boolean(this.model[action])) {
      this.model[action]();
    }
  }

  public emitDrawn(features: esri.Collection<esri.Graphic>) {
    if (this.collapseGraphics) {
      const collection = features.toArray();

      if (collection.length > 0) {
        const cloned = collection[0].clone();
        const geometryTypes = collection.reduce((acc, curr) => {
          const t = curr.geometry.type;
          if (acc.includes(t)) {
            return acc;
          } else {
            return [...acc, t];
          }
        }, []);

        if (geometryTypes.length === 1) {
          let geometryProp;

          // TODO: rings and paths should work fine. Multipoint and point will need tweaking.
          if (cloned.geometry.hasOwnProperty('rings')) {
            geometryProp = 'rings';
          } else if (cloned.geometry.hasOwnProperty('paths')) {
            geometryProp = 'paths';
          } else if (cloned.geometry.hasOwnProperty('multipoint')) {
            geometryProp = 'multipoint';
          } else if (cloned.geometry.hasOwnProperty('point')) {
            geometryProp = 'point';
          }

          const collapsedGeometry = collection.map((graphic) => {
            return graphic.geometry[geometryProp][0];
          });

          // Apply collapsed geometry to cloned graphic.
          cloned.geometry[geometryProp] = collapsedGeometry;

          // Reset some uneeded properties.
          cloned.layer = undefined;
          cloned.attributes = undefined;

          this.export.emit(cloned);
        } else {
          console.warn(
            `Drawn feature condensation is set to ${this.collapseGraphics}. Multiple geometry types were identified. Will not emit geometry.`
          );
        }
      } else {
        this.export.emit(collection);
      }
    } else {
      this.export.emit(features.toArray());
    }
  }
}

interface ISketchViewModel extends esri.SketchViewModel {
  toggleUpdateTool?: () => {};
}
