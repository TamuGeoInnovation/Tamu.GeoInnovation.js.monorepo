import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable } from 'rxjs';

import { EsriMapService, MapConfig } from '@tamu-gisc/maps/esri';
import { ScenarioService, SnapshotService } from '@tamu-gisc/cpa/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import esri = __esri;
import { map, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'tamu-gisc-scenario-builder',
  templateUrl: './scenario-builder.component.html',
  styleUrls: ['./scenario-builder.component.scss'],
  providers: [ScenarioService],
})
export class ScenarioBuilderComponent implements OnInit {
  public builderForm: FormGroup;

  public view: esri.MapView;
  public map: esri.Map;

  public isExisting: Observable<boolean>;

  public config: MapConfig = {
    basemap: {
      basemap: 'streets-navigation-vector',
    },
    view: {
      mode: '2d',
      properties: {
        center: [-97.657046, 26.450253],
        zoom: 11,
      },
    },
  };

  constructor(
    private fb: FormBuilder,
    private mapService: EsriMapService,
    private scenario: ScenarioService,
    private snapshot: SnapshotService,
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
    });
    // Instantiate builder form
    this.builderForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      mapCenter: ['', Validators.required],
      zoom: ['', Validators.required],
      layers: this.fb.array([]),
    });
  }

  public createScenario() {}

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
   * Allows adding multiple layers to the snapshot.
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
}
