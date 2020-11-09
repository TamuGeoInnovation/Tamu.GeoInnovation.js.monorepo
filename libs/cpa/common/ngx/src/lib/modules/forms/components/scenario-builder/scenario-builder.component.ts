import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Observable } from 'rxjs';
import { tap, map, shareReplay } from 'rxjs/operators';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { ScenarioService } from '@tamu-gisc/cpa/data-access';

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

  public isExisting: Observable<boolean>;

  constructor(
    private fb: FormBuilder,
    private mapService: EsriMapService,
    private scenario: ScenarioService,
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
      layers: this.fb.array([])
    });

    if (this.route.snapshot.params.guid) {
      this.scenario.getOne(this.route.snapshot.params.guid).subscribe((r) => {
        this.builderForm.patchValue(r);

        r.layers.forEach((l) => {
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
      this.scenario
        .update(this.route.snapshot.params.guid, this.builderForm.value)
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
            title: 'Update Scenario'
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
}
