import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DeepPartial } from 'typeorm';
import { Observable } from 'rxjs';
import { pluck, shareReplay } from 'rxjs/operators';

import * as JSZip from 'jszip';

import { ResponseService, WorkshopService } from '@tamu-gisc/cpa/ngx/data-access';
import { IResponseDto, IWorkshopRequestPayload } from '@tamu-gisc/cpa/data-api';
import { Snapshot } from '@tamu-gisc/cpa/common/entities';
import { EsriMapService, EsriModuleProviderService, MapConfig } from '@tamu-gisc/maps/esri';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss']
})
export class ExportComponent implements OnInit {
  private zip: JSZip;
  public form: FormGroup;

  public view: esri.MapView;
  public map: esri.Map;
  public graphicPreview: esri.GraphicsLayer;

  public workshops: Observable<IWorkshopRequestPayload[]>;
  public snapshots: Observable<DeepPartial<Snapshot>[]>;

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

  private _modules: {
    graphic: esri.GraphicConstructor;
    graphicsLayer: esri.GraphicsLayerConstructor;
  };

  constructor(
    private fb: FormBuilder,
    private mapService: EsriMapService,
    private mp: EsriModuleProviderService,
    private response: ResponseService,
    private workshop: WorkshopService
  ) {
    this.zip = new JSZip();
  }

  public ngOnInit(): void {
    this.form = this.fb.group({
      workshopGuid: [''],
      workshop: ['', Validators.required],
      shapes: ['', Validators.required],
      responses: [[]]
    });

    this.workshops = this.workshop.getWorkshops().pipe(shareReplay(1));

    this.mapService.store.subscribe((instance) => {
      this.view = instance.view as esri.MapView;
      this.map = instance.map;
    });

    this.form.controls.workshop.valueChanges.subscribe((workshop: IWorkshopRequestPayload) => {
      // We have the currently selected workshop, load the responses
      const responses = this.response.getResponsesForWorkshop(workshop.guid);

      // Set the snapshots from the workshop to a local observable
      this.snapshots = this.workshop.getWorkshop(workshop.guid).pipe(pluck('snapshots'));

      // Remove existing preview graphics
      this.map.removeAll();

      // With the responses, draw all responses on the preview map
      responses.subscribe((responsesResponse) => {
        // Make array of just the response geometries
        const onlyResponses = responsesResponse.map((response) => {
          return response;
        });

        // This is used when we export the data
        this.form.controls.responses.setValue(onlyResponses);

        const shapes = responsesResponse.map((response) => {
          return response.shapes;
        });

        if (shapes) {
          this.form.controls.shapes.setValue(shapes);
        }

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

            this.view.goTo(previewLayer.graphics);
          });
      });
    });
  }

  public exportAllData() {
    // Clear all existing files in the in-memory zip
    this.zip.forEach((fileName: string) => {
      this.zip.remove(fileName);
    });
    const formData = this.form.getRawValue();
    const wad = {
      points: [],
      polylines: [],
      polygons: []
    };

    if (formData.responses) {
      formData.responses.forEach((response) => {
        if (response.shapes) {
          response.shapes.forEach((shape) => {
            shape.attributes = {
              name: response.name,
              notes: response.notes,
              created: response.created,
              snapshot: response.snapshot?.title,
              snapshot_description: response.snapshot?.description
            };

            if (shape.geometry?.x && shape.geometry?.y) {
              wad.points.push(shape);
            } else if (shape.geometry?.paths) {
              wad.polylines.push(shape);
            } else if (shape.geometry?.rings) {
              wad.polygons.push(shape);
            } else {
              console.warn('We have no idea what this geometry type is', shape);
            }
          });
        }
      });

      // export to a featureset.json inside the temp dir
      if (wad.points.length > 0) {
        this.geometryArrayToEsriJson(wad.points, 'esriGeometryPoint');
      }

      if (wad.polylines.length > 0) {
        this.geometryArrayToEsriJson(wad.polylines, 'esriGeometryPolyline');
      }

      if (wad.polygons.length > 0) {
        this.geometryArrayToEsriJson(wad.polygons, 'esriGeometryPolygon');
      }
    }

    this.zip.generateAsync({ type: 'blob' }).then((blob) => {
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = this.form.controls.workshop.value.title;
      a.click();
      URL.revokeObjectURL(objectUrl);
    });
  }

  private geometryArrayToEsriJson(geometries: esri.Graphic[], geometry: IEsriGeometryPortalJSONType) {
    const featureSet: IEsriFeatureSetPortalJSON = {
      spatialReference: {
        latestWkid: 3857,
        wkid: 102100
      },
      geometryType: geometry,
      features: geometries,
      fields: [
        {
          alias: 'Name',
          name: 'name',
          type: 'esriFieldTypeString',
          length: 25
        },
        {
          alias: 'Notes',
          name: 'notes',
          type: 'esriFieldTypeString',
          length: 512
        },
        {
          alias: 'Created',
          name: 'created',
          type: 'esriFieldTypeString',
          length: 128
        },
        {
          alias: 'Snapshot_title',
          name: 'snapshot',
          type: 'esriFieldTypeString',
          length: 128
        },
        {
          alias: 'Snapshot_description',
          name: 'snapshot_description',
          type: 'esriFieldTypeString',
          length: 256
        }
      ]
    };

    // Write to the temp dir
    const geometryName = geometry.substring(12);
    const fileName = `${this.form.controls.workshop.value.title}_${geometryName}s.json`;
    this.zip.file(fileName, JSON.stringify(featureSet));
  }

  private flattenResponsesGraphics(responses: Array<IResponseDto>) {
    const flattenedShapesCollection = responses.reduce((accumulated, current) => {
      const shapes = (current.shapes as Array<esri.Graphic>).map((g) => {
        return this._modules.graphic.fromJSON(g);
      });

      return [...accumulated, ...shapes];
    }, []);

    return flattenedShapesCollection;
  }
}

export interface IEsriFeatureSetPortalJSON {
  displayFieldName?: string;
  fieldAliases?: {
    ['field']: string;
  };
  geometryType: IEsriGeometryPortalJSONType;
  hasZ?: boolean;
  hasM?: boolean;
  spatialReference: {
    wkid: number;
    latestWkid: number;
  };
  fields: [] | IEsriFieldPortalJSON[];
  features: (string | object)[] | esri.Graphic[];
}

export type IEsriGeometryPortalJSONType = 'esriGeometryPoint' | 'esriGeometryPolyline' | 'esriGeometryPolygon';

export interface IEsriFieldPortalJSON {
  name: string;
  alias: string;
  type:
    | 'esriFieldTypeString'
    | 'esriFieldTypeOID'
    | 'esriFieldTypeDate'
    | 'esriFieldTypeGlobalID'
    | 'esriFieldTypeDouble'
    | 'esriFieldTypeGeometry'
    | 'esriFieldTypeInteger';
  length: number;
}
