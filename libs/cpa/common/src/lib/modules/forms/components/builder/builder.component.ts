import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

import { EsriMapService } from '@tamu-gisc/maps/esri';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-builder',
  templateUrl: './builder.component.html',
  styleUrls: ['./builder.component.scss']
})
export class BuilderComponent implements OnInit {
  public form2: FormGroup;

  public view: esri.MapView;
  public map: esri.Map;

  constructor(private fb: FormBuilder, private mapService: EsriMapService) {}

  public ngOnInit() {
    this.mapService.store.subscribe((instances) => {
      this.view = instances.view as esri.MapView;
      this.map = instances.map;
    });

    this.form2 = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      center: ['', Validators.required],
      zoom: ['', Validators.required],
      layers: this.fb.array([this.fb.control('')])
    });
  }

  public setMapCenter(): void {
    const center = this.view.center;

    this.form2.controls.center.setValue(`${center.longitude.toFixed(4)}, ${center.latitude.toFixed(4)}`);
  }

  public setMapZoom(): void {
    const zoom = this.view.zoom;

    this.form2.controls.zoom.setValue(zoom);
  }

  public addLayer() {
    (this.form2.controls.layers as FormArray).push(this.fb.control(''));

    console.log(this.form2.get('layers'));
  }

  public removeLayer(index: number) {
    (this.form2.controls.layers as FormArray).removeAt(index);
  }

  public createScenario() {
    const value = this.form2.getRawValue();

    console.dir(value);
  }
}
