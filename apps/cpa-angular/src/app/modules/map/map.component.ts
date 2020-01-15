import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { LayerSource } from '@tamu-gisc/common/types';
import { MapConfig, EsriMapService } from '@tamu-gisc/maps/esri';
import { BasePopupComponent } from '@tamu-gisc/maps/feature/popup';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
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

  public form: FormGroup;
  public form2: FormGroup;
  public map: esri.Map;

  public form2Layers: Observable<Array<string>>;

  public selected = new BehaviorSubject([]);

  constructor(private fb: FormBuilder, private mapService: EsriMapService, private http: HttpClient) {}

  public ngOnInit() {
    this.form = this.fb.group({
      url: ['', Validators.required]
    });

    this.form2 = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      center: ['some center', Validators.required],
      zoom: ['', Validators.required],
      layers: this.fb.array([this.fb.control('')])
    });

    this.mapService.store.subscribe((instances) => {
      this.map = instances.map;
    });
  }

  public async submit() {
    const value = this.form.getRawValue();

    const layerInfo: ILayerInfo = await this.http.get(`${value.url}?f=json`).toPromise();

    const source: LayerSource = {
      type: 'feature',
      url: value.url,
      id: (layerInfo.name as string).toLowerCase().replace(/ /g, '-') + '-layer',
      title: layerInfo.name,
      native: {
        outFields: ['*']
      },
      popupComponent: BasePopupComponent
    };

    this.mapService.loadLayers([source]);
  }

  public submit2() {
    const value = this.form2.getRawValue();
  }

  public addLayer() {
    (this.form2.controls.layers as FormArray).push(this.fb.control(''));

    console.log(this.form2.get('layers'));
  }

  public async handleDrawSelection(e: esri.Graphic) {
    const layer = this.mapService.findLayerById('highwater-claims-layer') as esri.FeatureLayer;

    const query = await layer.queryFeatures({
      spatialRelationship: 'intersects',
      geometry: e.geometry,
      outFields: ['*']
    });

    this.selected.next(query.features);
  }
}

interface ILayerInfo extends Object {
  name?: string;
}
