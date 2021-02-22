import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Observable } from 'rxjs';
import { pluck, shareReplay } from 'rxjs/operators';
import * as JSZip from 'jszip';

import { IGraphic } from '@tamu-gisc/common/utils/geometry/esri';
import { ResponseService, WorkshopService } from '@tamu-gisc/cpa/data-access';
import { IResponseResponse, IWorkshopRequestPayload } from '@tamu-gisc/cpa/data-api';
import { Response, Snapshot } from '@tamu-gisc/cpa/common/entities';
import { EsriMapService, EsriModuleProviderService, MapConfig } from '@tamu-gisc/maps/esri';

import esri = __esri;
import { DeepPartial } from 'typeorm';

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
        center: [-97.657046, 26.450253],
        zoom: 11
      }
    }
  };

  private SOURCE_DIRECTORY = 'C:\\CPA_TEMP';

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
      // snapshotGuid: ['', Validators.required],
      workshop: ['', Validators.required],
      shapes: ['', Validators.required],
      responses: [[]]
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
    const formData = this.form.getRawValue();
    const responsesBySnapshot = [];

    // Separate the responses by snapshot
    const snapshotTitles = new Set();
    formData.responses.forEach((response: Response) => {
      snapshotTitles.add(response.snapshot?.title);
    });
    snapshotTitles.forEach((snapshotTitle) => {
      const snapshotShapes = formData.responses.filter((response) => {
        if (response.snapshot?.title === snapshotTitle) {
          // Set the attributes inside the shapes props
          response.shapes.forEach((shape) => {
            if (shape.geometry?.x && shape.geometry?.y) {
              console.log('This is a point', shape);
            } else if (shape.geometry?.paths) {
              console.log('This is a polyline', shape);
            } else if (shape.geometry?.rings) {
              console.log('This is a polygon, rect, or circle', shape);
            } else {
              console.log('We have no idea what this geometry type is', shape);
            }
            shape.attributes = {
              name: response.name,
              notes: response.notes,
              created: response.created
            };
          });
          return response;
        }
      });
      responsesBySnapshot.push(snapshotShapes);
    });
    const specificSnapshot = responsesBySnapshot.filter((responses) => {
      return responses.filter((response) => {
        if (response.snapshot.guid === this.form.controls.snapshotGuid.value) {
          return response;
        }
      });
    });
    console.log('specificSnapshot', this.form.controls.snapshotGuid.value, specificSnapshot);
    this.responseToEsriJson(responsesBySnapshot);
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

  private geometryArrayToEsriJson(geometries: IGraphic[], geometry: IEsriJsonGeometryType) {
    const featureSet: IEsriJsonFormat = {
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
          type: 'esriFieldTypeDate',
          length: 128
        }
      ]
    };

    // Write to the temp dir
    const geometryName = geometry.substring(12);
    const fileName = `${this.form.controls.workshop.value.title}_${geometryName}s.json`;
    this.zip.file(fileName, JSON.stringify(featureSet));
  }

  private responseToEsriJson(snapshotResponses: Array<IResponseResponse[]>) {
    snapshotResponses.forEach((snapshotResponse) => {
      const features = snapshotResponse.map((response: IResponseResponse) => {
        const shape = response.shapes[0];
        return shape;
      });

      const featureSet: IEsriJsonFormat = {
        spatialReference: {
          latestWkid: 3857,
          wkid: 102100
        },
        geometryType: 'esriGeometryPolyline',
        features: features,
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
            type: 'esriFieldTypeDate',
            length: 128
          }
        ]
      };
      // console.log('Here is a featureset: ', esri);
      const a = document.createElement('a');
      const blob = new Blob([JSON.stringify(featureSet)], { type: 'application/json' });
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = this.form.controls.workshopGuid.value;
      a.click();
      URL.revokeObjectURL(objectUrl);
    });
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
  geometryType: IEsriJsonGeometryType;
  hasZ?: boolean;
  hasM?: boolean;
  spatialReference: {
    wkid: number;
    latestWkid: number;
  };
  fields: [] | IEsriJsonFieldFormat[];
  features: (string | object)[] | IGraphic[];
}

export type IEsriJsonGeometryType = 'esriGeometryPoint' | 'esriGeometryPolyline' | 'esriGeometryPolygon';

export interface IEsriJsonFieldFormat {
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
