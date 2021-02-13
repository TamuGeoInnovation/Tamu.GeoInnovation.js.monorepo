import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { from, Observable } from 'rxjs';
import { map, pluck, shareReplay, take, tap, withLatestFrom } from 'rxjs/operators';

import { EsriMapService, EsriModuleProviderService, MapConfig } from '@tamu-gisc/maps/esri';
import { ResponseService, ScenarioService, SnapshotService, WorkshopService } from '@tamu-gisc/cpa/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { IResponseResponse, ISnapshotsResponse, IWorkshopRequestPayload } from '@tamu-gisc/cpa/data-api';
import { IGraphic } from '@tamu-gisc/common/utils/geometry/esri';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-scenario-builder',
  templateUrl: './scenario-builder.component.html',
  styleUrls: ['./scenario-builder.component.scss'],
  providers: [ScenarioService]
})
export class ScenarioBuilderComponent implements OnInit {
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

  private _modules: {
    graphic: esri.GraphicConstructor;
    graphicsLayer: esri.GraphicsLayerConstructor;
    featureLayer: esri.FeatureLayerConstructor;
  };

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
      snapshots: [[]]
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
              this.builderForm.patchValue(r);

              // Check to see we have workshops
              if (r.workshop) {
                this.selectedWorkshop = r.workshop?.guid;
                this.responses = this.response.getResponsesForWorkshop(this.selectedWorkshop).pipe(shareReplay());

                this.builderForm.controls.layers.valueChanges
                  .pipe(withLatestFrom(this.responses))
                  .subscribe(([guids, responses]: [string[], IResponseResponse[]]) => {
                    this.scenarioPreview.removeAll();
                    this.addResponseGraphics(guids, responses);
                  });

                this.builderForm.controls.snapshots.valueChanges
                  .pipe(withLatestFrom(this.snapshots))
                  .subscribe(([guids, snapshots]) => {
                    this.addOrRemoveSnapshots(snapshots, guids);
                  });

                this.mapService.store.pipe(take(1)).subscribe((instance) => {
                  this.view = instance.view as esri.MapView;
                  this.map = instance.map;
                  this.graphicPreview = new this._modules.graphicsLayer();
                  this.scenarioPreview = new this._modules.graphicsLayer();

                  this.map.add(this.graphicPreview);
                  this.map.add(this.scenarioPreview);

                  if (r.layers) {
                    if (r.workshop.responses) {
                      // For each workshop, look through it's responses and see if any match those found inside r.layers
                      // If we have a match, we know this scenario is based off of this workshop
                      const matched = r.workshop.responses.filter((response) => r.layers.includes(response.guid));

                      if (matched.length !== 0) {
                        // For every submission, pull out the graphics. This generates a single array of graphics
                        const flattened = this.flattenResponsesGraphics(matched);

                        this.scenarioPreview.addMany(flattened);
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

  public addOrRemoveSnapshots(snapshots: ISnapshotsResponse[], selectedSnapshots: string[]) {
    const removedSnapshots = Object.keys(this.scenarioSnapshots).filter(([key]) => {
      return selectedSnapshots.find((ss) => ss === key) === undefined;
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

        for (const snapshot of removedSnapshots) {
          const s = snapshots.find((snap) => snap.guid === snapshot);

          delete this.scenarioSnapshots[s.guid];
        }
      }
    }

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
