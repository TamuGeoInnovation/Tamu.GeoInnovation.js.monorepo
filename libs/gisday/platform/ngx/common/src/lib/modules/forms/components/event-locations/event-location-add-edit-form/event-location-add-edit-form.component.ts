import { Component, OnInit, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, filter, map, switchMap, take } from 'rxjs';

import { EventLocation, Place } from '@tamu-gisc/gisday/platform/data-api';
import { LocationService, PlaceService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { formatLatLonLines, isLatLonPolygon, parseLatLonLines } from '@tamu-gisc/common/utils/geometry';
import { CHECK_IN_MAX_ACCURACY } from '@tamu-gisc/gisday/common';
import { TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'tamu-gisc-event-location-add-edit-form',
  templateUrl: './event-location-add-edit-form.component.html',
  styleUrls: ['./event-location-add-edit-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, ReactiveFormsModule, TextboxComponent, SelectComponent, ButtonComponent, AsyncPipe]
})
export class EventLocationAddEditFormComponent implements OnInit {
  private readonly fb = inject(UntypedFormBuilder);
  private readonly rt = inject(Router);
  private readonly at = inject(ActivatedRoute);
  private readonly els = inject(LocationService);
  private readonly ps = inject(PlaceService);
  private readonly ns = inject(NotificationService);
  private readonly ss = inject(SeasonService);

  public readonly type = input<'create' | 'edit'>(undefined);

  public entity$: Observable<Partial<EventLocation>>;
  public places$: Observable<Array<Partial<Place>>>;
  public form: UntypedFormGroup;
  public readonly checkInMaxAccuracy = CHECK_IN_MAX_ACCURACY;

  public ngOnInit(): void {
    this.form = this.fb.group({
      guid: [null],
      building: [null],
      room: [null],
      capacity: [null],
      link: [null],
      place: [null],
      streetAddressOverride: [null],
      // The check-in zone's corners as typed, one `latitude, longitude` per line (#1766). Sent as
      // `checkInZone`.
      checkInZoneText: [''],
      season: [null]
    });

    this.places$ = this.ps.getEntitiesForActiveSeason();

    if (this.type() === 'edit') {
      this.entity$ = this.at.params.pipe(
        map((params) => params.guid),
        filter((guid) => guid !== undefined),
        switchMap((guid) => this.els.getEntity(guid))
      );

      this.entity$.pipe(take(1)).subscribe((entity) => {
        this.form.patchValue({
          ...entity,
          place: entity.place?.guid,
          checkInZoneText: formatLatLonLines(entity.checkInZone)
        });

        // If the entity has a season, remove the season control from the form
        this.form.removeControl('season');
      });
    } else {
      this.ss.activeSeason$.pipe(take(1)).subscribe((season) => {
        this.form.patchValue({
          season: season.guid
        });
      });
    }
  }

  public handleSubmission() {
    if (this.type() === 'create') {
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
    const rawValue = this._valueWithCheckInZone();

    if (!rawValue) {
      return;
    }

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
    const rawValue = this._valueWithCheckInZone();

    if (!rawValue) {
      return;
    }

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

  /**
   * The form's value with the typed corners read into `checkInZone`: `null` when none were typed,
   * or `undefined`, with a message, when they cannot be used.
   */
  private _valueWithCheckInZone(): Partial<EventLocation> | undefined {
    const { checkInZoneText, ...value } = this.form.getRawValue();
    const corners = parseLatLonLines(checkInZoneText);

    // The API refuses the same zones; this says why before sending.
    if (corners === undefined || (corners.length > 0 && !isLatLonPolygon(corners))) {
      this.ns.toast({
        id: 'event-location-check-in-zone-error',
        title: 'Check-In Zone',
        message: 'Type at least three corners, in order around the zone, one per line, each as latitude, longitude.'
      });

      return undefined;
    }

    return { ...value, checkInZone: corners.length > 0 ? corners : null };
  }

  private _navigateBack() {
    this.rt.navigate(['/admin/event-locations']);
  }
}
