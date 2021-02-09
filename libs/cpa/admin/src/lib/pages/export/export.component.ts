import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { IGraphic, PolygonMaker } from '@tamu-gisc/common/utils/geometry/esri';
import { ResponseService, WorkshopService } from '@tamu-gisc/cpa/data-access';
import { IResponseResponse, IWorkshopRequestPayload } from '@tamu-gisc/cpa/data-api';
import { EsriMapService, EsriModuleProviderService, MapConfig } from '@tamu-gisc/maps/esri';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss']
})
export class ExportComponent implements OnInit {
  public form: FormGroup;

  public view: esri.MapView;
  public map: esri.Map;
  public graphicPreview: esri.GraphicsLayer;

  public workshops: Observable<IWorkshopRequestPayload[]>;

  private _modules: {
    graphic: esri.GraphicConstructor;
    graphicsLayer: esri.GraphicsLayerConstructor;
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
    private response: ResponseService,
    private workshop: WorkshopService
  ) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      workshopGuid: ['', Validators.required],
      shapes: ['', Validators.required]
    });

    this.form.controls.workshopGuid.valueChanges.subscribe((workshopGuid) => {
      // We have the currently selected workshop, load the responses
      const responses = this.response.getResponsesForWorkshop(workshopGuid);

      // Remove existing preview graphics
      this.map.removeAll();

      responses.subscribe((responsesResponse) => {
        // Make array of just the response geometries
        const shapes = responsesResponse.map((response) => {
          return response.shapes;
        });
        if (shapes) {
          this.form.controls.shapes.setValue(shapes);
        }
        // const polygons = this.polygonMaker.makeArrayOfPolygons(shapes as IGraphic[]);
        this.mp
          .require(['Graphic', 'GraphicsLayer'])
          .then(([g, gl]: [esri.GraphicConstructor, esri.GraphicsLayerConstructor]) => {
            this._modules = {
              graphic: g,
              graphicsLayer: gl
            };
            const polygons = this.flattenResponsesGraphics(responsesResponse);
            // Add the polygons to a new graphics layer
            const previewLayer = new this._modules.graphicsLayer({
              graphics: polygons
            });
            this.map.add(previewLayer);
          });
      });
    });

    this.mapService.store.subscribe((instance) => {
      this.view = instance.view as esri.MapView;
      this.map = instance.map;
    });

    // Load workshops
    this.workshops = this.workshop.getWorkshops().pipe(shareReplay(1));
  }

  public exportData() {
    const value = this.form.getRawValue();
    delete value.workshopGuid;
    const export2: IEsriJsonFormat = {
      geometryType: 'idk',
      features: value,
      spatialReference: 'mercator'
    };
    const a = document.createElement('a');
    const blob = new Blob([JSON.stringify(export2)], { type: 'application/json' });
    const objectUrl = URL.createObjectURL(blob);
    a.href = objectUrl;
    a.download = this.form.controls.workshopGuid.value;
    a.click();
    URL.revokeObjectURL(objectUrl);
  }

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

export interface IEsriJsonFormat {
  displayFieldName?: string;
  fieldAliases?: {
    ['field']: string;
  };
  geometryType: string;
  hasZ?: boolean;
  hasM?: boolean;
  spatialReference: string;
  fields?: [];
  features: [IGraphic];
}
