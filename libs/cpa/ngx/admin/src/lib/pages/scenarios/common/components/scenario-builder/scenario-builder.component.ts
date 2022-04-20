import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { from, fromEventPattern, merge, Observable, Subject } from 'rxjs';
import {
  delay,
  distinctUntilChanged,
  filter,
  map,
  mapTo,
  pluck,
  reduce,
  shareReplay,
  skip,
  startWith,
  switchMap,
  take,
  tap,
  withLatestFrom
} from 'rxjs/operators';

import { LayerReference } from '@tamu-gisc/cpa/common/entities';
import { EsriMapService, EsriModuleProviderService, MapConfig } from '@tamu-gisc/maps/esri';
import { ResponseService, ScenarioService, SnapshotService, WorkshopService } from '@tamu-gisc/cpa/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import {
  IResponseDto,
  IResponseResolved,
  IScenarioPartial,
  ISnapshotPartial,
  IWorkshopRequestPayload,
  IScenarioResolved
} from '@tamu-gisc/cpa/data-api';
import { IGraphic } from '@tamu-gisc/common/utils/geometry/esri';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-scenario-builder',
  templateUrl: './scenario-builder.component.html',
  styleUrls: ['./scenario-builder.component.scss'],
  providers: [EsriMapService]
})
export class ScenarioBuilderComponent implements OnInit, OnDestroy {
  public builderForm: FormGroup;

  public view: esri.MapView;
  public map: esri.Map;
  public graphicPreview: esri.GraphicsLayer;
  public snapshotResponsePreview: esri.GraphicsLayer;
  public scenarioResponsePreview: esri.GraphicsLayer;
  public scenarioSnapshots: { [key: string]: ISnapshotPartial } = {};

  public selectedWorkshop: string;
  public isExisting: Observable<boolean>;

  public workshopResponses: Observable<IResponseResolved[]>;
  /**
   * List of workshops used to scope a new scenario.
   */
  public workshops: Observable<IWorkshopRequestPayload[]>;

  /**
   * List of ALL snapshots belonging to the scenario's referenced workshop and not.
   */
  public allSnapshots: Observable<ISnapshotPartial[]>;
  /**
   * List of scenarios scoped to the scenario's referenced workshop.
   *
   * This list does not include the current scenario.
   */
  public workshopScenarios: Observable<IScenarioResolved[]>;

  /**
   * List of snapshots scoped to the scenario's referenced workshop
   */
  public workshopSnapshots: Observable<ISnapshotPartial[]>;

  private _modules: {
    graphic: esri.GraphicConstructor;
    graphicsLayer: esri.GraphicsLayerConstructor;
    featureLayer: esri.FeatureLayerConstructor;
    groupLayer: esri.GroupLayerConstructor;
  };

  private $destroy: Subject<boolean> = new Subject();

  public config: MapConfig = {
    basemap: {
      basemap: 'streets-navigation-vector'
    },
    view: {
      mode: '2d',
      properties: {
        center: [-99.20987760767717, 31.225356084754477],
        zoom: 4
      }
    }
  };

  /**
   * The snapshot map extent. Is not null when the returned snapshot from server has an
   * extent defined.
   */
  public mapExtent$: Observable<null | esri.ExtentProperties>;

  /**
   * Listens on the map view extent for changes and emits when the user updates the preview map extent.
   */
  public mapViewExtentChanged$: Observable<boolean>;

  /**
   * Emits when the map view extent has been recorded. Used a signal to disable
   * the extent save button.
   */
  private _mapViewRecorded$: Subject<boolean> = new Subject();

  constructor(
    private fb: FormBuilder,
    private mapService: EsriMapService,
    private mp: EsriModuleProviderService,
    private scenario: ScenarioService,
    private response: ResponseService,
    private snapshot: SnapshotService,
    private workshop: WorkshopService,
    private router: Router,
    private route: ActivatedRoute,
    private ns: NotificationService
  ) {}

  public ngOnInit() {
    this.isExisting = this.route.params.pipe(
      map((params) => {
        return params.guid !== undefined;
      }),
      shareReplay(1)
    );

    // Instantiate builder form
    this.builderForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      mapCenter: [''],
      zoom: [null],
      extent: [undefined],
      // This control is a placeholder so we don't have to manually create it on scenario create/update.
      layers: [[]],
      snapshots: [[]],
      scenarioResponses: [[]],
      snapshotResponses: [[]]
    });

    this.mapExtent$ = this.builderForm.valueChanges.pipe(
      map((form) => {
        return form.extent;
      })
    );

    this.mapViewExtentChanged$ = merge(
      this.mapService.store.pipe(
        take(1),
        switchMap(({ view }) => {
          let handle: esri.Handle;

          const add = (handler) => {
            handle = view.watch('extent', handler);
          };

          const remove = () => {
            handle.remove();
          };

          return fromEventPattern(add, remove).pipe(
            map<[esri.Extent, esri.Extent], esri.ExtentProperties>(([newExtent]) => {
              return newExtent.toJSON();
            }),
            skip(1) // The initial extent patching from snapshot will emit once. Do not emit this.
          );
        }),
        mapTo(true)
      ),
      this._mapViewRecorded$.pipe(mapTo(false))
    ).pipe(startWith(false), distinctUntilChanged());

    // Fetch all Workshops
    this.workshops = this.workshop.getWorkshops().pipe(shareReplay(1));

    this.allSnapshots = this.snapshot.getAll().pipe(shareReplay(1));

    // Get esri modules first. We'll need these for basically anything else in the builder, so
    // it makes sense to ensure they are available before we continue any additional setup
    from(this.mp.require(['Graphic', 'GraphicsLayer', 'FeatureLayer', 'GroupLayer'])).subscribe(
      ([graphic, graphicsLayer, featureLayer, groupLayer]: [
        esri.GraphicConstructor,
        esri.GraphicsLayerConstructor,
        esri.FeatureLayerConstructor,
        esri.GroupLayerConstructor
      ]) => {
        this._modules = {
          graphic: graphic,
          graphicsLayer: graphicsLayer,
          featureLayer: featureLayer,
          groupLayer: groupLayer
        };

        // If we are in /details, populate the form
        this.route.params.pipe(pluck('guid')).subscribe((scenarioGuid) => {
          if (scenarioGuid) {
            this.scenario.getOne(scenarioGuid).subscribe((s) => {
              const snapshotsGuids = s.layers.filter((l) => l.type === 'snapshot').map((l) => l.guid);
              const scenarioGuids = s.layers.filter((l) => l.type === 'scenario').map((l) => l.guid);
              const snapshotResponseGuids = s.layers.filter((l) => l.type === 'snapshot-responses').map((l) => l.guid);

              // Check to see we have workshops
              if (s.workshopScenario && s.workshopScenario.workshop !== undefined) {
                this.selectedWorkshop = s.workshopScenario?.workshop?.guid;

                this.workshopSnapshots = this.snapshot.getForWorkshop(this.selectedWorkshop);
                this.workshopScenarios = this.scenario.getForWorkshop(this.selectedWorkshop).pipe(
                  map((scenarios) => {
                    return scenarios.filter((scenario) => scenario.guid !== scenarioGuid);
                  })
                );
                this.workshopResponses = this.response.getResponsesForWorkshop(this.selectedWorkshop).pipe(shareReplay(1));

                // Setup event handler for form snapshot selection
                this.builderForm.controls.snapshots.valueChanges
                  .pipe(skip(1), withLatestFrom(this.allSnapshots))
                  .subscribe(([guids, snapshots]) => {
                    this.addOrRemoveSnapshots(snapshots, guids);
                  });

                this.builderForm.controls.scenarioResponses.valueChanges
                  .pipe(withLatestFrom(this.workshopResponses))
                  .subscribe(([scenGuids, responses]) => {
                    this.setScenarioResponseGraphics(scenGuids, responses);
                  });

                this.builderForm.controls.snapshotResponses.valueChanges
                  .pipe(withLatestFrom(this.workshopResponses))
                  .subscribe(([snapGuids, responses]) => {
                    this.setSnapshotResponseGraphics(snapGuids, responses);
                  });

                // Instantiate the preview layers
                this.mapService.store.pipe(take(1), delay(100)).subscribe((instance) => {
                  this.view = instance.view as esri.MapView;
                  this.map = instance.map;
                  this.graphicPreview = new this._modules.graphicsLayer();
                  this.snapshotResponsePreview = new this._modules.graphicsLayer();
                  this.scenarioResponsePreview = new this._modules.graphicsLayer();

                  this.map.addMany([this.graphicPreview, this.snapshotResponsePreview, this.scenarioResponsePreview]);

                  if (s.layers) {
                    this.builderForm.patchValue({
                      ...s,
                      snapshots: snapshotsGuids,
                      scenarioResponses: scenarioGuids,
                      snapshotResponses: snapshotResponseGuids
                    });

                    // Change default zoom and center to values in scenario response.
                    if (s.mapCenter !== undefined) {
                      // Change default zoom and center to values in snapshot response.
                      if (s.extent !== null) {
                        this.view.extent = s.extent as esri.Extent;
                      } else if (s.mapCenter !== null && s.zoom !== null) {
                        this.view.goTo({
                          center: s.mapCenter.split(',').map((c) => parseFloat(c)),
                          zoom: s.zoom
                        });
                      }
                    }
                  }
                });
              } else {
                console.warn('No workshops');
              }
            });
          }
        });
      }
    );
  }

  public ngOnDestroy() {
    this.$destroy.next(undefined);
    this.$destroy.complete();
  }

  public setWorkshopScenario(workshop: string) {
    if (workshop) {
      this.selectedWorkshop = workshop;
      this.workshopResponses = this.response.getResponsesForWorkshop(this.selectedWorkshop).pipe(shareReplay());
    }
  }

  /**
   * Gets map service instance map center and sets the center control value using lat, lon format.
   */
  public setMapCenter() {
    const center = this.view.center;

    this.builderForm.controls.mapCenter.setValue(`${center.longitude.toFixed(4)}, ${center.latitude.toFixed(4)}`);
  }

  /**
   * Gets map service instance current zoom level and sets the zoon control value.
   */
  public setMapZoom() {
    const zoom = this.view.zoom;

    this.builderForm.controls.zoom.setValue(zoom);
  }

  /**
   * Previews response shapes from a snapshot or a scenario.
   */
  public loadPreviewResponse(response: IResponseResolved) {
    // Remove existing Response preview graphic
    this.clearGraphicPreview();

    // Since the graphics were created through the `toJSON` Graphic method,
    // here we'll just let the API do its thing in the opposite direction so we
    // don't have to manually construct them. In this way, they will also inherit
    // custom symbol colors.
    const graphics = this.instantiateGraphicsFromJSON(response.shapes);

    this.graphicPreview.addMany(graphics);
  }

  /**
   * Filters out the responses that belong to the provided scenario guid, and adds them to the map for preview.
   */
  public loadScenarioResponsesPreview(scenario: IScenarioPartial) {
    this.workshopResponses
      .pipe(
        switchMap((s) => from(s)),
        filter((response) => {
          return response.scenario !== null && response.scenario.guid === scenario.guid;
        }),
        reduce((acc, response) => {
          return [...acc, ...response.shapes];
        }, [] as Array<IGraphic>)
      )
      .subscribe((wsResponses) => {
        this.clearGraphicPreview();

        const graphics = this.instantiateGraphicsFromJSON(wsResponses);

        this.graphicPreview.addMany(graphics);
      });
  }

  /**
   * Filters out the responses that belong to the provided snapshot guid, and adds them to the map for preview.
   */
  public loadSnapshotResponsesPreview(snapshot: ISnapshotPartial) {
    this.workshopResponses
      .pipe(
        switchMap((s) => from(s)),
        filter((response) => {
          return response.snapshot !== null && response.snapshot.guid === snapshot.guid;
        }),
        reduce((acc, response) => {
          return [...acc, ...response.shapes];
        }, [] as Array<IGraphic>)
      )
      .subscribe((wsResponses) => {
        this.clearGraphicPreview();

        const graphics = this.instantiateGraphicsFromJSON(wsResponses);

        this.graphicPreview.addMany(graphics);
      });
  }

  /**
   * Clears all of the graphics form the graphic preview layer used
   * to preview individual responses and entire scenario responses.
   */
  public clearGraphicPreview() {
    this.graphicPreview.removeAll();
  }

  public getTitleFromResponseSource(response: IResponseDto) {
    if (response.scenario) {
      return response.scenario.title;
    }
    if (response.snapshot) {
      return response.snapshot.title;
    }
  }

  public addOrRemoveSnapshots(snapshots: ISnapshotPartial[], selectedSnapshots: string[]) {
    const removedSnapshots = Object.keys(this.scenarioSnapshots).filter((key) => {
      return (
        selectedSnapshots.find((ss) => {
          return ss === key;
        }) === undefined
      );
    });

    const addedSnapshots = selectedSnapshots.filter((ss) => {
      return ss in this.scenarioSnapshots === false;
    });

    if (removedSnapshots.length > 0) {
      const layers = removedSnapshots.map((removedGuid) => {
        return this.map.findLayerById(removedGuid);
      });

      if (layers.length > 0) {
        this.map.removeMany(layers);

        // Once the layers have been removed from the map, remove them from the dictionary
        for (const snapshot of removedSnapshots) {
          const s = snapshots.find((snap) => snap.guid === snapshot);

          delete this.scenarioSnapshots[s.guid];
        }
      }
    }

    // If snapshots have been added as a result of a form change, load their constituting layers.
    // Each snapshot is added as a group layer, and all layers for the group layer are added as sub-layers
    if (addedSnapshots.length > 0) {
      const layers = addedSnapshots.reduce((acc, snapshotGuid) => {
        const snapshot = snapshots.find((snap) => snap.guid === snapshotGuid);

        const groupLyr = new this._modules.groupLayer({
          title: snapshot.title,
          id: snapshot.guid,
          layers: snapshot.layers.reverse().map((layer) => {
            return new this._modules.featureLayer({
              id: layer.info.layerId,
              title: layer.info.name,
              url: layer.url,
              opacity: layer.info.drawingInfo.opacity
            });
          })
        });

        return [...acc, groupLyr];
      }, []);

      this.map.addMany(layers);

      // For each snapshot guid, add the key to the state variable along with the snapshot definition.
      //
      // The state variable is used to deconstruct a snapshot since it contains definitions for all the layers
      // which it is made of.
      for (const snapshot of addedSnapshots) {
        const s = snapshots.find((snap) => snap.guid === snapshot);

        this.scenarioSnapshots[snapshot] = s;
      }
    }
  }

  /**
   * Permanently adds scenario response graphics to the map preview
   */
  public setScenarioResponseGraphics(selectedScenarioGuids: string[], responses: IResponseResolved[]) {
    this.scenarioResponsePreview.removeAll();

    const selectedScenariosResponses = responses.filter((response) => {
      return response.scenario !== null && selectedScenarioGuids.includes(response.scenario.guid);
    });

    const flattened = this.flattenResponsesGraphics(selectedScenariosResponses);

    this.scenarioResponsePreview.addMany(flattened);
  }

  /**
   * Permanently adds snapshot response graphics to the map preview
   */
  public setSnapshotResponseGraphics(selectedSnapshotGuids: string[], responses: IResponseResolved[]) {
    this.snapshotResponsePreview.removeAll();

    const selectedSnapshotResponses = responses.filter((response) => {
      return response.snapshot !== null && selectedSnapshotGuids.includes(response.snapshot.guid);
    });

    const flattened = this.flattenResponsesGraphics(selectedSnapshotResponses);

    this.snapshotResponsePreview.addMany(flattened);
  }

  public createScenario() {
    const value = this.builderForm.getRawValue() as ScenarioFormValue;

    if (this.route.snapshot.params.guid) {
      // Combine the snapshots and responses. Snapshots are typically used as contextual base layers for responses, so they
      // they are at the bottom of the stack.
      const combinedLayers = [
        ...this.composeReferenceLayers(value.snapshots, 'snapshot'),
        ...this.composeReferenceLayers(value.snapshotResponses, 'snapshot-responses'),
        ...this.composeReferenceLayers(value.scenarioResponses, 'scenario')
      ];

      // Remove the snapshots object from the form value, as the backend calls an update function and fails if provided.
      delete value.snapshots;
      delete value.scenarioResponses;
      delete value.snapshotResponses;

      const scenario: IScenarioPartial = JSON.parse(JSON.stringify(value));

      scenario.layers = combinedLayers;

      this.scenario
        .update(this.route.snapshot.params.guid, scenario)
        .pipe(
          tap(() => {
            // Disable the form while the async operation is executed.
            this.builderForm.disable();
          })
        )
        .subscribe(
          (updateStatus) => {
            // Re-enable the form
            this.builderForm.enable();

            this.ns.toast({
              message: 'Scenario was successfully updated.',
              id: 'scenario-update',
              title: 'Scenario Updated'
            });
          },
          (err) => {
            this.ns.toast({
              message: 'Scenario could not be updated.',
              id: 'scenario-update',
              title: 'Scenario Update Failed'
            });
          }
        );
    } else {
      delete value.snapshots;
      delete value.scenarioResponses;
      delete value.snapshotResponses;

      const scenario: IScenarioPartial = JSON.parse(JSON.stringify(value));

      this.scenario.create(scenario).subscribe((res) => {
        this.workshop.addScenario(this.selectedWorkshop, res.guid).subscribe(
          (addScenarioStatus) => {
            this.router.navigate([`../edit/${res.guid}`], { relativeTo: this.route });

            this.ns.toast({
              message: 'Scenario was successfully created.',
              id: 'scenario-create',
              title: 'Scenario Created'
            });
          },
          (err) => {
            this.ns.toast({
              message: 'Scenario could not be created.',
              id: 'scenario-create',
              title: 'Scenario Create Failed',
              acknowledge: false
            });
          }
        );
      });
    }
  }

  /**
   * From a collection of responses, extracts and accumulates all of the graphics from each
   * to return a one-dimensional array of esri graphics.
   */
  private flattenResponsesGraphics(responses: Array<IResponseDto>) {
    const flattenedShapesCollection = responses.reduce((accumulated, current) => {
      const shapes = (current.shapes as Array<IGraphic>).map((g) => {
        return this._modules.graphic.fromJSON(g);
      });

      return [...accumulated, ...shapes];
    }, []);

    return flattenedShapesCollection;
  }

  /**
   * Creates graphic class instances from graphic portal JSON representations.
   */
  private instantiateGraphicsFromJSON(graphics: Array<IGraphic>) {
    return graphics.map((graphic) => {
      return this._modules.graphic.fromJSON(graphic);
    });
  }

  private composeReferenceLayers(guids: Array<string>, type: LayerReference['type']): Array<LayerReference> {
    return guids.map((guid) => {
      return {
        guid,
        type
      };
    });
  }

  public recordExtent() {
    const extent = this.view.extent.toJSON();

    this.builderForm.patchValue({ extent });

    this._mapViewRecorded$.next(true);
  }

  public clearExtent() {
    this.builderForm.patchValue({ extent: null });
  }
}

interface ScenarioFormValue {
  title: string;
  description: string;
  mapCenter: string;
  zoom: number;
  extent: number;
  snapshots: Array<string>;
  scenarioResponses: Array<string>;
  snapshotResponses: Array<string>;
}
