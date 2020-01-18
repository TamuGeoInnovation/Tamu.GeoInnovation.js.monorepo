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
  public builderForm: FormGroup;

  public view: esri.MapView;
  public map: esri.Map;

  constructor(private fb: FormBuilder, private mapService: EsriMapService) {}

  public ngOnInit() {
    this.mapService.store.subscribe((instances) => {
      this.view = instances.view as esri.MapView;
      this.map = instances.map;
    });

    // Instantiate builder form
    this.builderForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      center: ['', Validators.required],
      zoom: ['', Validators.required],
      layers: this.fb.array([])
    });

    // Adds an initial layer group to the layers form array.
    this.addLayer();
  }

  /**
   * Gets map service instance map center and sets the center control value using lat, lon format.
   */
  public setMapCenter(): void {
    const center = this.view.center;

    this.builderForm.controls.center.setValue(`${center.longitude.toFixed(4)}, ${center.latitude.toFixed(4)}`);
  }

  /**
   * Gets map service instance current zoom level and sets the zoon control value.
   */
  public setMapZoom(): void {
    const zoom = this.view.zoom;

    this.builderForm.controls.zoom.setValue(zoom);
  }

  /**
   * Adds a layer group to the layers form array.
   *
   * Allows adding multiple layers to the scenario.
   */
  public addLayer() {
    (this.builderForm.controls.layers as FormArray).push(
      this.fb.group({
        url: ['']
      })
    );
  }

  /**
   * Removes a layer form group from the form array at a given index.
   */
  public removeLayer(index: number) {
    (this.builderForm.controls.layers as FormArray).removeAt(index);
  }

  public createScenario() {
    const value = this.builderForm.getRawValue();

    console.dir(value);
  }
}
