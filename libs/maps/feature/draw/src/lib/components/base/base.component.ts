import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { from, Subject, combineLatest, ReplaySubject } from 'rxjs';
import { takeUntil, filter, switchMap, take, map } from 'rxjs/operators';

import { EsriModuleProviderService, EsriMapService, MapServiceInstance } from '@tamu-gisc/maps/esri';
import { FeatureSelectorService } from '@tamu-gisc/maps/feature/feature-selector';

import esri = __esri;

@Component({
  template: '',
  providers: [FeatureSelectorService]
})
export class BaseDrawComponent implements OnInit, OnDestroy {
  public model: ISketchViewModel;

  @Input()
  public reference: string;

  @Input()
  public defaultUpdateTool: 'transform' | 'move' | 'reshape' = 'transform';

  public activeUpdateTool: 'transform' | 'move' | 'reshape';

  /**
   * Describes the emission format for the drawn features. By default (`false`) the component
   * will emit individual graphics for each feature.
   *
   * If `true` is provided, the component is limited to exporting only a single type of geometry,
   * due to the single-geometry type limitation per graphic. Use when the desired output is a SINGLE
   * graphic with multiple polygons/lines/points.
   */
  @Input()
  public collapseGraphics = false;

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

  // Version group/tools  default rendering states

  @Input()
  public versionTools = true;

  @Input()
  public undoTool = true;

  @Input()
  public redoTool = true;

  @Output()
  public export: EventEmitter<esri.Graphic[] | esri.Graphic> = new EventEmitter();

  private _$destroy: Subject<boolean> = new Subject();
  private _$loaded: ReplaySubject<boolean> = new ReplaySubject();
  private _activeToolWatchHandle: esri.WatchHandle;
  private _layersAddWatchHandle: esri.WatchHandle;

  constructor(
    private mapService: EsriMapService,
    public moduleProvider: EsriModuleProviderService,
    private selector: FeatureSelectorService
  ) {}

  public ngOnInit() {
    this.activeUpdateTool = this.defaultUpdateTool;

    if (this.reference !== undefined) {
      combineLatest([from(this.moduleProvider.require(['SketchViewModel'])), this.mapService.store])
        .pipe(takeUntil(this._$destroy))
        .subscribe(([[SketchViewModel], mapInstance]: [[esri.SketchViewModelConstructor], MapServiceInstance]) => {
          const l = mapInstance.map.findLayerById(this.reference);

          this.model = new SketchViewModel({
            view: mapInstance.view,
            layer: l,
            defaultUpdateOptions: {
              toggleToolOnClick: this.reshapeTool
            }
          });

          this.model.on('create', (event: Partial<ISketchViewModelEvent & esri.SketchViewModelCreateEvent>) => {
            if (event.state === 'complete') {
              this.onCreate(event);
            }
          });

          // Handle component graphic emissions on any valid update event type:
          //
          // - Shape update complete
          // - Shape move stop
          // - Shape reshape stop
          this.model.on('update', (event: Partial<ISketchViewModelEvent & esri.SketchViewModelUpdateEvent>) => {
            if (
              event.state === 'complete' ||
              (event.toolEventInfo && event.toolEventInfo.type === 'move-stop') ||
              (event.toolEventInfo && event.toolEventInfo.type === 'reshape-stop') ||
              (event.toolEventInfo && event.toolEventInfo.type === 'rotate-stop') ||
              (event.toolEventInfo && event.toolEventInfo.type === 'scale-stop')
            ) {
              this.onUpdate();
            }
          });

          this.model.on('delete', () => {
            this.onDelete();
          });

          this._layersAddWatchHandle = mapInstance.map.allLayers.on('after-add', () => {
            this.reorder(mapInstance.map);
          });

          this._activeToolWatchHandle = this.model.watch('activeTool', (tool) => {
            if (tool === null) {
              this.activeUpdateTool = this.defaultUpdateTool;
            } else {
              this.activeUpdateTool = tool;
            }
          });

          this._$loaded.next(true);

          setTimeout(() => {
            this.reorder(mapInstance.map);
          }, 1000);
        });

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
    this._$destroy.next(undefined);
    this._$destroy.complete();

    // Possible for the watch handle to not exist on component destroy.
    // Calling undefined method will throw error if that's the case.
    if (this._activeToolWatchHandle !== undefined) {
      this._activeToolWatchHandle.remove();
    }

    this._layersAddWatchHandle.remove();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onCreate(event: Partial<ISketchViewModelEvent & esri.SketchViewModelCreateEvent>) {
    // While event is not used in this class, it is used by superclasses and cannot be removed
    // otherwise signatures will not be the same.
    this.emitDrawn(this.model.layer.graphics);
  }

  public onUpdate() {
    this.emitDrawn(this.model.layer.graphics);
  }

  public onDelete() {
    this.emitDrawn(this.model.layer.graphics);
  }

  /**
   * Calls the model graphic create method with the provided tool name.
   */
  public create(tool) {
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
  public setUpdateTool(tool) {
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
    if (action in this.model) {
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

          // TODO: rings and paths should work fine. Multi point and point will need tweaking.
          if ('rings' in cloned.geometry) {
            geometryProp = 'rings';
          } else if ('paths' in cloned.geometry) {
            geometryProp = 'paths';
          } else if ('multipoint' in cloned.geometry) {
            geometryProp = 'multipoint';
          } else if ('point' in cloned.geometry) {
            geometryProp = 'point';
          }

          const collapsedGeometry = collection.map((graphic) => {
            return graphic.geometry[geometryProp][0];
          });

          // Apply collapsed geometry to cloned graphic.
          cloned.geometry[geometryProp] = collapsedGeometry;

          // Reset some unnecessary properties.
          cloned.layer = undefined;
          cloned.attributes = undefined;

          this.export.emit(cloned);
        } else {
          console.warn(
            `Drawn feature collapsing is set to ${this.collapseGraphics}. Multiple geometry types were identified. Will not emit geometry.`
          );
        }
      } else {
        this.export.emit(collection);
      }
    } else {
      this.export.emit(features.toArray());
    }
  }

  /**
   * Draws the provided graphics on the target draw layer.
   *
   * Emits a 'create' event.
   */
  public draw(graphics: esri.Graphic[]) {
    this._$loaded.pipe(take(1)).subscribe(() => {
      this.model.layer.addMany(graphics);
      this.model.emit('create', {
        type: 'create',
        state: 'complete',
        graphics: this.model.layer.graphics
      });
    });
  }

  public repositionLayer(position: 'beginning' | 'end') {
    this.mapService.store
      .pipe(
        take(1),
        map((instance) => instance.map)
      )
      .subscribe((esriMapInstance) => {
        if (position === 'beginning') {
          esriMapInstance.reorder(this.model.layer, 0);
        } else if (position === 'end') {
          esriMapInstance.reorder(this.model.layer, 99);
        }
      });
  }

  /**
   * Clears the target draw layer
   *
   * Emits a 'delete' event.
   */
  public reset() {
    this._$loaded.pipe(take(1)).subscribe(() => {
      this.model.layer.removeAll();
      this.model.emit('delete', {
        graphics: this.model.layer.graphics,
        type: 'delete'
      });
    });
  }

  private reorder(map: esri.Map) {
    map.reorder(this.model.layer, map.allLayers.length - 1);
  }
}

export interface ISketchViewModel extends esri.SketchViewModel {
  toggleUpdateTool?: () => unknown;
}

export interface ISketchViewModelEvent {
  target: ISketchViewModel;
}
