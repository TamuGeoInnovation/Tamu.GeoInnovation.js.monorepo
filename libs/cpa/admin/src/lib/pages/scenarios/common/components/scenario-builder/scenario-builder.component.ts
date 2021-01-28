import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';

import { EsriMapService, EsriModuleProviderService, MapConfig } from '@tamu-gisc/maps/esri';
import { ResponseService, ScenarioService, WorkshopService } from '@tamu-gisc/cpa/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { IGraphic, IResponseResponse, IWorkshopRequestPayload } from '@tamu-gisc/cpa/data-api';

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
  public featureLayer: esri.FeatureLayer;

  public isExisting: Observable<boolean>;
  public responses: Observable<IResponseResponse[]>;
  public workshops: Observable<IWorkshopRequestPayload[]>;
  public selectedWorkshop: IWorkshopRequestPayload;

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
    private workshop: WorkshopService,
    private router: Router,
    private route: ActivatedRoute,
    private ns: NotificationService
  ) {}

  public ngOnInit() {
    this.isExisting = this.route.params.pipe(
      map((params) => Boolean(params['guid'])),
      shareReplay(1)
    );

    this.mapService.store.subscribe((instances) => {
      this.view = instances.view as esri.MapView;
      this.map = instances.map;
      this.mp.require(['GraphicsLayer']).then(([GraphicsLayer]: [esri.GraphicsLayerConstructor]) => {
        this.graphicPreview = new GraphicsLayer();
        this.scenarioPreview = new GraphicsLayer();
        this.map.add(this.graphicPreview);
        this.map.add(this.scenarioPreview);
      });
    });

    // Instantiate builder form
    this.builderForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      mapCenter: [''],
      zoom: [''],
      layers: [[]],
      layerGuids: [[]]
    });

    // If we are in /details, populate the form
    if (this.route.snapshot.params.guid) {
      this.scenario.getOne(this.route.snapshot.params.guid).subscribe((r) => {
        this.builderForm.patchValue(r);
      });
    }

    // Get both the layer guids and the responses
    this.builderForm.controls.layerGuids.valueChanges.subscribe((guids: string[]) => {
      this.responses.subscribe((responses) => {
        // Find those responses that intersect with the currently selected guids (checkboxes)
        const selectedResponses = responses.filter((currentResponse) => guids.includes(currentResponse.guid));

        // Add these responses to the form for submission
        this.builderForm.controls.layers.setValue(
          selectedResponses.map((value) => {
            return value.shapes;
          })
        );

        this.mp
          .require(['Graphic', 'Polygon', 'SimpleFillSymbol', 'SimpleLineSymbol'])
          .then(
            ([Graphic, Polygon, SimpleFillSymbol, SimpleLineSymbol]: [
              esri.GraphicConstructor,
              esri.PolygonConstructor,
              esri.SimpleFillSymbolConstructor,
              esri.SimpleLineSymbolConstructor
            ]) => {
              // Clear the scenarioPreview layer
              this.scenarioPreview.removeAll();

              // Get an array of esri.Graphics
              const graphics: Array<esri.Graphic> = selectedResponses.map((response) => {
                const graphicProperties = response.shapes as IGraphic;
                // Use the values from the database to create a new Graphic and add it to the graphicPreview layer
                const graphic = new Graphic({
                  geometry: new Polygon({
                    rings: graphicProperties.geometry.rings,
                    spatialReference: graphicProperties.geometry.spatialReference
                  }),
                  symbol: new SimpleFillSymbol({
                    color: [114, 168, 250, 0.4],
                    outline: new SimpleLineSymbol({
                      type: 'simple-line',
                      style: 'solid',
                      color: [114, 168, 250, 0.7],
                      width: graphicProperties.symbol.outline.width
                    })
                  })
                });

                return graphic;
              });

              this.scenarioPreview.addMany(graphics);
            }
          );
      });
    });

    // Fetch all Workshops
    this.workshops = this.workshop.getWorkshops();
  }

  public async loadPreviewResponseLayer(response: IResponseResponse) {
    // Remove existing Response preview graphic
    this.graphicPreview.removeAll();

    // Get the required esri modules
    this.graphicPreview.add(await EsriGraphicTools.makeGraphic(this.mp, response.shapes as IGraphic));
    // this.mp
    //   .require(['Graphic', 'Polygon', 'SimpleFillSymbol', 'SimpleLineSymbol'])
    //   .then(
    //     ([Graphic, Polygon, SimpleFillSymbol, SimpleLineSymbol]: [
    //       esri.GraphicConstructor,
    //       esri.PolygonConstructor,
    //       esri.SimpleFillSymbolConstructor,
    //       esri.SimpleLineSymbolConstructor
    //     ]) => {
    //       const graphicProperties = response.shapes as IGraphic;

    //       // Use the values from the database to create a new Graphic and add it to the graphicPreview layer
    //       const graphic = new Graphic({
    //         geometry: new Polygon({
    //           rings: graphicProperties.geometry.rings,
    //           spatialReference: graphicProperties.geometry.spatialReference
    //         }),
    //         symbol: new SimpleFillSymbol({
    //           color: [250, 128, 114, 0.4],
    //           outline: new SimpleLineSymbol({
    //             type: 'simple-line',
    //             style: 'solid',
    //             color: [250, 128, 114, 0.7],
    //             width: graphicProperties.symbol.outline.width
    //           })
    //         })
    //       });

    //       this.graphicPreview.add(graphic);
    //     }
    //   );
  }

  public clearPreviewLayer() {
    this.graphicPreview.removeAll();
  }

  public createScenario() {
    const rawValue = this.builderForm.getRawValue();
    const value = {
      title: rawValue.title,
      description: rawValue.description,
      mapCenter: rawValue.mapCenter,
      zoom: rawValue.zoom,
      layers: rawValue.layerGuids
    };
    if (this.route.snapshot.params.guid) {
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

        this.ns.toast({
          message: 'Scenario was created successfully.',
          id: 'scenario-create',
          title: 'New Scenario',
          acknowledge: false
        });
      });
    }
  }

  public setWorkshopScenario(workshop: IWorkshopRequestPayload) {
    // Workshop can be undefined
    if (workshop) {
      this.selectedWorkshop = workshop;
      this.responses = this.response.getResponsesForWorkshop(workshop.guid);
      this.workshop.addScenario(workshop.guid, this.route.snapshot.params['guid']).subscribe(() => {});
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
   * Adds a layer group to the layers form array.
   *
   * Allows adding multiple response layers to the scenario.
   */
  public addLayer(url?: object) {}

  /**
   * Removes a layer form group from the form array at a given index.
   */
  public removeLayer(index: number) {
    (this.builderForm.controls.layers as FormArray).removeAt(index);
  }
}

export class EsriGraphicTools {
  public static makeArrayOfGraphics(mp: EsriModuleProviderService, shapes: IGraphic[], color: number[] = [250, 128, 114]) {
    return mp
      .require(['Graphic', 'Polygon', 'SimpleFillSymbol', 'SimpleLineSymbol'])
      .then(
        ([Graphic, Polygon, SimpleFillSymbol, SimpleLineSymbol]: [
          esri.GraphicConstructor,
          esri.PolygonConstructor,
          esri.SimpleFillSymbolConstructor,
          esri.SimpleLineSymbolConstructor
        ]) => {
          const graphics: esri.Graphic[] = [];
          shapes.forEach((graphicProperties: IGraphic) => {
            // Use the values from the database to create a new Graphic and add it to the graphicPreview layer
            const graphic = new Graphic({
              geometry: new Polygon({
                rings: graphicProperties.geometry.rings,
                spatialReference: graphicProperties.geometry.spatialReference
              }),
              symbol: new SimpleFillSymbol({
                color: [...color, 0.4],
                outline: new SimpleLineSymbol({
                  type: 'simple-line',
                  style: 'solid',
                  color: [...color, 0.7],
                  width: graphicProperties.symbol.outline.width
                })
              })
            });

            graphics.push(graphic);
          });
        }
      );
  }

  public static makeGraphic(mp: EsriModuleProviderService, shape: IGraphic, color: number[] = [250, 128, 114]) {
    return mp
      .require(['Graphic', 'Polygon', 'SimpleFillSymbol', 'SimpleLineSymbol'])
      .then(
        ([Graphic, Polygon, SimpleFillSymbol, SimpleLineSymbol]: [
          esri.GraphicConstructor,
          esri.PolygonConstructor,
          esri.SimpleFillSymbolConstructor,
          esri.SimpleLineSymbolConstructor
        ]) => {
          // Use the values from the database to create a new Graphic and add it to the graphicPreview layer
          const graphic = new Graphic({
            geometry: new Polygon({
              rings: shape.geometry.rings,
              spatialReference: shape.geometry.spatialReference
            }),
            symbol: new SimpleFillSymbol({
              color: [...color, 0.4],
              outline: new SimpleLineSymbol({
                type: 'simple-line',
                style: 'solid',
                color: [...color, 0.7],
                width: shape.symbol.outline.width
              })
            })
          });

          return graphic;
        }
      );
  }
}
