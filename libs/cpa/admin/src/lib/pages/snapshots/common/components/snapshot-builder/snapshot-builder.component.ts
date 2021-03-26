import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

import { forkJoin, Observable } from 'rxjs';
import { tap, map, shareReplay } from 'rxjs/operators';

import { EsriMapService, MapConfig } from '@tamu-gisc/maps/esri';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { SnapshotService } from '@tamu-gisc/cpa/data-access';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-snapshot-builder',
  templateUrl: './snapshot-builder.component.html',
  styleUrls: ['./snapshot-builder.component.scss'],
  providers: [EsriMapService]
})
export class SnapshotBuilderComponent implements OnInit {
  public builderForm: FormGroup;

  public view: esri.MapView;
  public map: esri.Map;

  public isExisting: Observable<boolean>;

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

  constructor(
    private fb: FormBuilder,
    private mapService: EsriMapService,
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
      description: [''],
      mapCenter: [''],
      zoom: [''],
      extent: [undefined],
      layers: this.fb.array([]),
      isContextual: ['']
    });

    if (this.route.snapshot.params.guid) {
      forkJoin([this.snapshot.getOne(this.route.snapshot.params.guid), this.mapService.store]).subscribe(
        ([snapshot, instances]) => {
          this.builderForm.patchValue(snapshot);

          snapshot.layers.forEach((l) => {
            this.addLayer(l);
          });

          // Change default zoom and center to values in snapshot response.
          if (snapshot.extent !== null) {
            instances.view.extent = snapshot.extent as esri.Extent;
          } else if (snapshot.mapCenter !== null || snapshot.zoom !== null) {
            instances.view.goTo({
              center: snapshot.mapCenter.split(',').map((c) => parseFloat(c)),
              zoom: snapshot.zoom
            });
          }
        }
      );
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

  public createSnapshot() {
    const value = this.builderForm.getRawValue();

    if (this.route.snapshot.params.guid) {
      this.snapshot
        .update(this.route.snapshot.params.guid, value)
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
            message: 'Snapshot was updated successfully.',
            id: 'snapshot-update',
            title: 'Updated Snapshot'
          });
        });
    } else {
      this.snapshot.create(value).subscribe((res) => {
        this.router.navigate([`../edit/${res.guid}`], { relativeTo: this.route });

        this.ns.toast({
          message: 'Snapshot was created successfully.',
          id: 'snapshot-create',
          title: 'New Snapshot',
          acknowledge: false
        });
      });
    }
  }

  public recordExtent() {
    const extent = this.view.extent.toJSON();

    this.builderForm.patchValue({ extent });
  }
}
