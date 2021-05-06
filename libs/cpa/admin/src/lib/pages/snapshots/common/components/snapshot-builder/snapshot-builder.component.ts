import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

import { DragulaService } from 'ng2-dragula';

import { forkJoin, Observable } from 'rxjs';
import { tap, map, shareReplay, take } from 'rxjs/operators';

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
export class SnapshotBuilderComponent implements OnInit, OnDestroy {
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
    private ns: NotificationService,
    private ds: DragulaService
  ) {
    // Limit layer configuration dragging to the handle element.
    ds.createGroup('LAYERS', {
      moves: (el, container, handle) => {
        return handle.className === 'handle' || handle.className === 'material-icons';
      }
    });
  }

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

          // The desired behavior is: top-most layer in the UI should result in a layer on top of all others on map
          // Adding layers increases the their stack index, and the highest index means above everything else.
          //
          // In order to do this, we must add layers the other way around so that the first item in the array
          // is actually last to be added so it receives the highest index, even though in the model it occupies
          // the 0th position.
          const layers = snapshot.layers.reverse();

          layers.forEach((l) => {
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

  public ngOnDestroy() {
    this.ds.destroy('LAYERS');
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
   * @param {object} [url] URL of the layer. Layer will be resolved by inner layer configurator
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

    // Because the layer order in the UI and model are inverted due to how layers
    // are loaded and their indexes work, the model has the layers in a reversed order,
    // so before updating, their order has to be reversed once more.
    value.layers = value.layers.reverse();

    if (this.route.snapshot.params.guid) {
      this.snapshot
        .update(this.route.snapshot.params.guid, value)
        .pipe(
          tap(() => {
            // Disable the form while the async operation is executed.
            this.builderForm.disable();
          })
        )
        .subscribe(
          (updateStatus) => {
            // Re-enable the form
            this.builderForm.enable();

            this.ns.toast({
              message: 'Snapshot was successfully updated.',
              id: 'snapshot-update',
              title: 'Snapshot Updated'
            });
          },
          (err) => {
            this.ns.toast({
              message: 'Snapshot could not be updated.',
              id: 'snapshot-update',
              title: 'Snapshot Update Failed'
            });
          }
        );
    } else {
      this.snapshot.create(value).subscribe(
        (res) => {
          this.router.navigate([`../edit/${res.guid}`], { relativeTo: this.route });

          this.ns.toast({
            message: 'Snapshot was successfully created.',
            id: 'snapshot-create',
            title: 'Snapshot Created'
          });
        },
        (err) => {
          this.ns.toast({
            message: 'Snapshot could not be created.',
            id: 'snapshot-create',
            title: 'Snapshot Create Failed'
          });
        }
      );
    }
  }

  public recordExtent() {
    const extent = this.view.extent.toJSON();

    this.builderForm.patchValue({ extent });
  }
}
