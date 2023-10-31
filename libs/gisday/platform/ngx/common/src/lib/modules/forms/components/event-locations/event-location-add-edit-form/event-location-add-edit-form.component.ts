import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, filter, map, switchMap, take } from 'rxjs';

import { EventLocation, Place } from '@tamu-gisc/gisday/platform/data-api';
import { LocationService, PlaceService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

@Component({
  selector: 'tamu-gisc-event-location-add-edit-form',
  templateUrl: './event-location-add-edit-form.component.html',
  styleUrls: ['./event-location-add-edit-form.component.scss']
})
export class EventLocationAddEditFormComponent implements OnInit {
  @Input()
  public type: 'create' | 'edit';

  public entity$: Observable<Partial<EventLocation>>;
  public places$: Observable<Array<Partial<Place>>>;
  public form: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly rt: Router,
    private readonly at: ActivatedRoute,
    private readonly els: LocationService,
    private readonly ps: PlaceService,
    private readonly ns: NotificationService
  ) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      guid: [null],
      building: [null],
      room: [null],
      capacity: [null],
      link: [null],
      place: [null],
      streetAddressOverride: [null]
    });

    this.places$ = this.ps.getEntities();

    if (this.type === 'edit') {
      this.entity$ = this.at.params.pipe(
        map((params) => params.guid),
        filter((guid) => guid !== undefined),
        switchMap((guid) => this.els.getEntity(guid))
      );

      this.entity$.pipe(take(1)).subscribe((entity) => {
        this.form.patchValue({
          ...entity,
          place: entity.place?.guid
        });
      });
    }
  }

  public handleSubmission() {
    if (this.type === 'create') {
      this._createEntity();
    } else {
      this._updateEntity();
    }
  }

  public deleteEntity() {
    this.els.deleteEntity(this.form.getRawValue().guid).subscribe({
      next: () => {
        this.ns.toast({
          id: 'delete-event-location-success',
          title: 'Delete Event Location',
          message: 'Event location deleted successfully.'
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'delete-event-location-error',
          title: 'Delete Event Location',
          message: `Error deleting event location: ${err.status}`
        });
      }
    });
  }

  private _updateEntity() {
    const rawValue = this.form.getRawValue();

    this.els.updateEntity(rawValue.guid, rawValue).subscribe({
      next: () => {
        this.ns.toast({
          id: 'update-event-location-success',
          title: 'Update Event Location',
          message: 'Event location updated successfully.'
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'update-event-location-error',
          title: 'Update Event Location',
          message: `Error updating event location: ${err.status}`
        });
      }
    });
  }

  private _createEntity() {
    const rawValue = this.form.getRawValue();

    this.els.createEntity(rawValue).subscribe({
      next: () => {
        this.ns.toast({
          id: 'create-event-location-success',
          title: 'Create Event Location',
          message: 'Event location created successfully.'
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'create-event-location-error',
          title: 'Create Event Location',
          message: `Error creating event location: ${err.status}`
        });
      }
    });
  }

  private _navigateBack() {
    this.rt.navigate(['/admin/event-locations']);
  }
}

