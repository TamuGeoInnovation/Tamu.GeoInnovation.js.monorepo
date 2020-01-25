import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

import { EsriMapService } from '@tamu-gisc/maps/esri';

import { ScenarioService } from '../../services/scenario.service';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-builder',
  templateUrl: './scenario-builder.component.html',
  styleUrls: ['./scenario-builder.component.scss'],
  providers: [ScenarioService]
})
export class ScenarioBuilderComponent implements OnInit {
  public builderForm: FormGroup;

  public view: esri.MapView;
  public map: esri.Map;

  constructor(
    private fb: FormBuilder,
    private mapService: EsriMapService,
    private scenario: ScenarioService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  public ngOnInit() {
    this.mapService.store.subscribe((instances) => {
      this.view = instances.view as esri.MapView;
      this.map = instances.map;
    });

    // Instantiate builder form
    this.builderForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      mapCenter: ['', Validators.required],
      zoom: ['', Validators.required],
      layers: this.fb.array([])
    });

    if (this.route.snapshot.params.guid) {
      this.scenario.getScenario(this.route.snapshot.params.guid).subscribe((r) => {
        this.builderForm.patchValue(r);

        ((r.layers as unknown) as Array<unknown>).forEach((l: any) => {
          this.addLayer(l);
        });
      });
    } else {
      // Adds an initial layer group to the layers form array.
      this.addLayer();
    }
  }

  /**
   * Gets map service instance map center and sets the center control value using lat, lon format.
   */
  public setMapCenter(): void {
    const center = this.view.center;

    this.builderForm.controls.mapCenter.setValue(`${center.longitude.toFixed(4)}, ${center.latitude.toFixed(4)}`);
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
  public addLayer(url?: object) {
    const props = url && typeof url === 'object' ? { ...url } : { url: '' };

    (this.builderForm.controls.layers as FormArray).push(this.fb.group(props));
  }

  /**
   * Removes a layer form group from the form array at a given index.
   */
  public removeLayer(index: number) {
    (this.builderForm.controls.layers as FormArray).removeAt(index);
  }

  public createScenario() {
    const value = this.builderForm.getRawValue();

    if (this.route.snapshot.params.guid) {
      this.scenario.updateScenario(this.route.snapshot.params.guid, this.builderForm.value).subscribe((updateStatus) => {});
    } else {
      console.log('create new scenario');
      this.scenario.createScenario(value).subscribe((res) => {
        this.router.navigate([res.guid], { relativeTo: this.route });
      });
    }
  }
}
