import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { from, Observable, Subject } from 'rxjs';
import { delay, map, pluck, shareReplay, skip, take, tap, withLatestFrom } from 'rxjs/operators';

import { EsriMapService, EsriModuleProviderService, MapConfig } from '@tamu-gisc/maps/esri';
import { ResponseService, ScenarioService, SnapshotService, WorkshopService } from '@tamu-gisc/cpa/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import {
  IResponseResponse,
  IScenariosResponse,
  IScenariosResponseResolved,
  ISnapshotsResponse,
  IWorkshopRequestPayload,
  ResponsesController
} from '@tamu-gisc/cpa/data-api';
import { IGraphic } from '@tamu-gisc/common/utils/geometry/esri';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-scenario-builder',
  templateUrl: './scenario-builder.component.html',
  styleUrls: ['./scenario-builder.component.scss'],
  providers: [ScenarioService, EsriMapService]
})
export class ScenarioBuilderComponent implements OnInit, OnDestroy {
  public builderForm: FormGroup;

  public view: esri.MapView;
  public map: esri.Map;
  public graphicPreview: esri.GraphicsLayer;
  public scenarioPreview: esri.GraphicsLayer;
  public scenarioSnapshots: { [key: string]: ISnapshotsResponse } = {};

  public selectedWorkshop: string;
  public isExisting: Observable<boolean>;

  public responses: Observable<IResponseResponse[]>;
  public workshops: Observable<IWorkshopRequestPayload[]>;
  public snapshots: Observable<ISnapshotsResponse[]>;
  public scenarios: Observable<IScenariosResponseResolved[]>;

  private _modules: {
    graphic: esri.GraphicConstructor;
    graphicsLayer: esri.GraphicsLayerConstructor;
    featureLayer: esri.FeatureLayerConstructor;
  };

  private $destroy: Subject<boolean> = new Subject();

  public config: MapConfig = {
    basemap: {
      basemap: 'streets-navigation-vector'
    },
    view: {
      mode: '2d',
      properties: {
        center: [-97.657046, 26.450253],
        zoom: 11
      }
    }
  };

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
      zoom: [''],
      layers: [[]],
      snapshots: [[]],
      scenarios: [[]]
    });

    // Fetch all Workshops
    this.workshops = this.workshop.getWorkshops().pipe(shareReplay(1));

    this.snapshots = this.snapshot.getAll().pipe(shareReplay(1));

    // Get esri modules first. We'll need these for basically anything else in the builder, so
    // it makes sense to ensure they are available before we continue any additional setup
    from(this.mp.require(['Graphic', 'GraphicsLayer', 'FeatureLayer'])).subscribe(
      ([g, gl, fl]: [esri.GraphicConstructor, esri.GraphicsLayerConstructor, esri.FeatureLayerConstructor]) => {
        this._modules = {
          graphic: g,
          graphicsLayer: gl,
          featureLayer: fl
        };

        // If we are in /details, populate the form
        this.route.params.pipe(pluck('guid')).subscribe((guid) => {
          if (guid) {
            this.scenario.getOne(guid).subscribe((r) => {
              const responsesGuids = r.layers.filter((l) => l.type === 'response').map((l) => l.guid);
              const snapshotsGuids = r.layers.filter((l) => l.type === 'snapshot').map((l) => l.guid);

              // Check to see we have workshops
              if (r.workshop) {
                this.selectedWorkshop = r.workshop?.guid;
                this.responses = this.response.getResponsesForWorkshop(this.selectedWorkshop).pipe(shareReplay());

                this.scenarios = this.scenario.getForWorkshop(this.selectedWorkshop).pipe(
                  map((scenarios) => {
                    return scenarios.filter((scenario) => scenario.guid !== this.selectedWorkshop);
                  })
                );

                this.builderForm.controls.snapshots.valueChanges
                  .pipe(skip(1), withLatestFrom(this.snapshots))
                  .subscribe(([guids, snapshots]) => {
                    this.addOrRemoveSnapshots(snapshots, guids);
                  });

                this.builderForm.controls.layers.valueChanges
                  .pipe(skip(1), withLatestFrom(this.responses))
                  .subscribe(([guids, responses]: [string[], IResponseResponse[]]) => {
                    this.scenarioPreview.removeAll();
                    this.addResponseGraphics(guids, responses);
                  });

                this.mapService.store.pipe(take(1), delay(100)).subscribe((instance) => {
                  this.view = instance.view as esri.MapView;
                  this.map = instance.map;
                  this.graphicPreview = new this._modules.graphicsLayer();
                  this.scenarioPreview = new this._modules.graphicsLayer();

                  this.map.add(this.graphicPreview);
                  this.map.add(this.scenarioPreview);

                  if (r.layers) {
                    this.builderForm.patchValue({ ...r, layers: responsesGuids, snapshots: snapshotsGuids });
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
    this.$destroy.next();
    this.$destroy.complete();
  }

  public loadPreviewResponseLayer(response: IResponseResponse) {
    // Remove existing Response preview graphic
    this.graphicPreview.removeAll();

    // Since the graphics were created through the `toJSON` Graphic method,
    // here we'll just let the API do its thing in the opposite direction so we
    // don't have to manually construct them. In this way, they will also inherit
    // custom symbol colors.
    const graphics = (response.shapes as Array<IGraphic>).map((graphic) => {
      return this._modules.graphic.fromJSON(graphic);
    });

    this.graphicPreview.addMany(graphics);
  }

  public getTitleFromResponseSource(response: IResponseResponse) {
    if (response.scenario) {
      return response.scenario.title;
    }
    if (response.snapshot) {
      return response.snapshot.title;
    }
  }

  /**
   * Diffs the loc
   */
  public addOrRemoveSnapshots(snapshots: ISnapshotsResponse[], selectedSnapshots: string[]) {
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
      const layerIds = removedSnapshots.reduce((acc, snapshot) => {
        const s = snapshots.find((snap) => snap.guid === snapshot);

        const ids = s.layers.map((l) => {
          return l.info.layerId;
        });

        return [...acc, ...ids];
      }, []);

      const layers = layerIds.map((lid) => {
        return this.map.findLayerById(lid);
      });

      if (layers.length > 0) {
        this.map.removeMany(layers);

        // Once the layers have been removed from the map, remove the dictionary
        for (const snapshot of removedSnapshots) {
          const s = snapshots.find((snap) => snap.guid === snapshot);

          delete this.scenarioSnapshots[s.guid];
        }
      }
    }

    // If snapshots have been added as a result of a form change, load their constituting layers.
    if (addedSnapshots.length > 0) {
      const layers = addedSnapshots.reduce((acc, snapshotGuid) => {
        const s = snapshots.find((snap) => snap.guid === snapshotGuid);

        const l = s.layers.map((layer) => {
          return new this._modules.featureLayer({
            id: layer.info.layerId,
            title: layer.info.name,
            url: layer.url
          });
        });

        return [...acc, ...l];
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

  public createScenario() {
    const value = this.builderForm.getRawValue();

    if (this.route.snapshot.params.guid) {
      // TODO: What does this do? Causes a race condition
      // this.scenario.updateWorkshop(this.selectedWorkshop, this.route.snapshot.params.guid).subscribe((addScenarioStatus) => {
      //   console.log(addScenarioStatus);
      // });

      // Combine the snapshots and responses. Snapshots are typically used as contextual base layers for responses, so they
      // they are at the bottom of the stack.
      const combinedLayers = [...value.snapshots, ...value.layers];

      // Remove the snapshots object from the form value, as the backend calls an update function and fails if provided.
      delete value.snapshots;
      delete value.scenarios;

      value.layers = combinedLayers;

      this.scenario
        .update(this.route.snapshot.params.guid, value)
        .pipe(
          tap(() => {
            // Disable the form while the async operation is executed.
            this.builderForm.disable();
          })
        )
        .subscribe((updateStatus) => {
          // Re-enable the form
          this.builderForm.enable();
          this.ns.toast({
            message: 'Scenario was updated successfully.',
            id: 'scenario-update',
            title: 'Updated Scenario'
          });
        });
    } else {
      this.scenario.create(value).subscribe((res) => {
        this.router.navigate([`../edit/${res.guid}`], { relativeTo: this.route });

        this.workshop.addScenario(this.selectedWorkshop, res.guid).subscribe((addScenarioStatus) => {
          console.log(addScenarioStatus.guid);
        });

        this.ns.toast({
          message: 'Scenario was created successfully.',
          id: 'scenario-create',
          title: 'New Scenario',
          acknowledge: false
        });
      });
    }
  }

  public setWorkshopScenario(workshop: string) {
    // Workshop can be undefined
    if (workshop) {
      this.selectedWorkshop = workshop;
      this.responses = this.response.getResponsesForWorkshop(this.selectedWorkshop).pipe(shareReplay());
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

  public async addResponseGraphics(guids: string[], responses: IResponseResponse[]) {
    // Find those responses that intersect with the currently selected guids (checkboxes)
    const selectedResponses = responses.filter((currentResponse) => guids.includes(currentResponse.guid));

    const flattened = this.flattenResponsesGraphics(selectedResponses);

    this.scenarioPreview.addMany(flattened);
  }

  /**
   * From a collection of responses, extracts and accumulates all of the graphics from each
   * to return a one-dimensional array of esri graphics.
   */
  private flattenResponsesGraphics(responses: Array<IResponseResponse>) {
    const flattenedShapesCollection = responses.reduce((accumulated, current) => {
      const shapes = (current.shapes as Array<IGraphic>).map((g) => {
        return this._modules.graphic.fromJSON(g);
      });

      return [...accumulated, ...shapes];
    }, []);

    return flattenedShapesCollection;
  }
}
