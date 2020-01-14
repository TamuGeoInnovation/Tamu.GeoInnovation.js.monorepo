import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { LayerSource } from '@tamu-gisc/common/types';
import { MapConfig, EsriMapService } from '@tamu-gisc/maps/esri';
import { BasePopupComponent } from '@tamu-gisc/maps/feature/popup';

import esri = __esri;
import { HttpClient } from '@angular/common/http';

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
  public map: esri.Map;

  constructor(private formBuilder: FormBuilder, private mapService: EsriMapService, private http: HttpClient) {}

  public ngOnInit() {
    this.form = this.formBuilder.group({
      url: ['', Validators.required]
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

  public handleDrawSelection(e) {
    debugger;
  }
}

interface ILayerInfo extends Object {
  name?: string;
}
