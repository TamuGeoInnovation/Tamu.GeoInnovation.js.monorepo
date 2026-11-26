import { Component, OnInit, inject, input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, filter, map, switchMap, take } from 'rxjs';

import { EventBroadcast, Place } from '@tamu-gisc/gisday/platform/data-api';
import { BroadcastService, PlaceService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { AsyncPipe } from '@angular/common';

import { adminEntityForm } from '../../../admin-entity-form';

@Component({
  selector: 'tamu-gisc-broadcast-add-edit-form',
  templateUrl: './broadcast-add-edit-form.component.html',
  styleUrls: ['./broadcast-add-edit-form.component.scss'],
  imports: [FormsModule, ReactiveFormsModule, TextboxComponent, SelectComponent, ButtonComponent, AsyncPipe]
})
export class BroadcastAddEditFormComponent implements OnInit {
  private readonly fb = inject(UntypedFormBuilder);
  /** Its save and delete, and what they say (#3340). */
  private readonly saves = adminEntityForm('Broadcast', '/admin/broadcasts');
  private readonly at = inject(ActivatedRoute);
  private readonly bs = inject(BroadcastService);
  private readonly ps = inject(PlaceService);
  private readonly ns = inject(NotificationService);
  private readonly ss = inject(SeasonService);

  public readonly type = input.required<'create' | 'edit'>();

  public entity$: Observable<Partial<EventBroadcast>>;
  public places$: Observable<Array<Partial<Place>>>;
  public form: UntypedFormGroup;

  public ngOnInit(): void {
    this.form = this.fb.group({
      guid: [''],
      // The organization the broadcast belongs to (#3048), as a venue has (#443): each site lists only its own places'
      // broadcasts. Required, so a new or saved broadcast always has one; one made before this has none until set.
      place: [null, Validators.required],
      name: [''],
      presenterUrl: [''],
      password: [''],
      phoneNumber: [''],
      meetingId: [''],
      publicUrl: [''],
      details: [''],
      season: ['']
    });

    this.places$ = this.ps.getEntitiesForActiveSeason();

    if (this.type() === 'edit') {
      this.entity$ = this.at.params.pipe(
        map((params) => params.guid),
        filter((guid) => guid !== undefined),
        switchMap((guid) => this.bs.getEntity(guid))
      );

      this.entity$.pipe(take(1)).subscribe((entity) => {
        this.form.patchValue({ ...entity, place: entity.place?.guid ?? null });
        this.form.removeControl('season');
      });
    } else {
      this.ss.activeSeason$.pipe(take(1)).subscribe((season) => {
        // With no active season, the form's season is left empty.
        if (season) {
          this.form.patchValue({ season: season.guid });
        }
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
    this.saves.save('delete', this.bs.deleteEntity(this.form.getRawValue().guid));
  }

  private _updateEntity() {
    const rawValue = this._valueWithPlace();

    if (!rawValue) {
      return;
    }

    this.saves.save('update', this.bs.updateEntity(rawValue.guid, rawValue));
  }

  private _createEntity() {
    const rawValue = this._valueWithPlace();

    if (!rawValue) {
      return;
    }

    this.saves.save('create', this.bs.createEntity(rawValue));
  }

  /** The form's value, or `undefined`, with a message, when it has no organization (#3048), as a venue's form does (#443). */
  private _valueWithPlace() {
    if (this.form.controls.place.invalid) {
      this.form.controls.place.markAsTouched();
      this.ns.toast({
        id: 'broadcast-place-error',
        title: 'Organization',
        message: "Select the broadcast's organization. Each site lists only its own organizations' broadcasts."
      });

      return undefined;
    }

    return this.form.getRawValue();
  }
}
