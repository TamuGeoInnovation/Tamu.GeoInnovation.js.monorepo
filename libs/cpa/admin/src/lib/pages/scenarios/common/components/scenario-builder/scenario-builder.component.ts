import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable } from 'rxjs';
import { map, shareReplay, tap, withLatestFrom } from 'rxjs/operators';

import { EsriMapService, EsriModuleProviderService, MapConfig } from '@tamu-gisc/maps/esri';
import { ResponseService, ScenarioService, WorkshopService } from '@tamu-gisc/cpa/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { IResponseResponse, IWorkshopRequestPayload } from '@tamu-gisc/cpa/data-api';
import { IGraphic, PolygonMaker } from '@tamu-gisc/common/utils/geometry/esri';

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

    // Setup the PolygonMaker
    PolygonMaker.build();

    // If we are in /details, populate the form
    if (this.route.snapshot.params.guid) {
      this.scenario.getOne(this.route.snapshot.params.guid).subscribe((r) => {
        this.builderForm.patchValue(r);
      });
    }

    // Fetch all Workshops
    this.workshops = this.workshop.getWorkshops().pipe(shareReplay(1));
  }

  public async loadPreviewResponseLayer(response: IResponseResponse) {
    // Remove existing Response preview graphic
    this.graphicPreview.removeAll();

    const graphic = await PolygonMaker.makePolygon(response.shapes as IGraphic);
    this.graphicPreview.add(graphic);
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
    // console.log('createScenario', value);
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
      this.responses = this.response.getResponsesForWorkshop(workshop.guid).pipe(shareReplay());

      this.builderForm.controls.layerGuids.valueChanges
        .pipe(withLatestFrom(this.responses))
        .subscribe(([guids, responses]: [string[], IResponseResponse[]]) => {
          this.addResponseGraphics(guids, responses);
        });
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

    // Add these responses to the form for submission
    this.builderForm.controls.layers.setValue(
      selectedResponses.map((value) => {
        return value.shapes;
      })
    );

    const graphics = await PolygonMaker.makeArrayOfPolygons(
      selectedResponses.map((response) => response.shapes) as IGraphic[]
    );
    this.scenarioPreview.addMany(graphics);
  }
}
