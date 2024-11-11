import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, filter, map, switchMap, take } from 'rxjs';

import { EventBroadcast } from '@tamu-gisc/gisday/platform/data-api';
import { BroadcastService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

@Component({
  selector: 'tamu-gisc-broadcast-add-edit-form',
  templateUrl: './broadcast-add-edit-form.component.html',
  styleUrls: ['./broadcast-add-edit-form.component.scss']
})
export class BroadcastAddEditFormComponent implements OnInit {
  @Input()
  public type: 'create' | 'edit';

  public entity$: Observable<Partial<EventBroadcast>>;
  public form: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly rt: Router,
    private readonly at: ActivatedRoute,
    private readonly bs: BroadcastService,
    private readonly ns: NotificationService,
    private readonly ss: SeasonService
  ) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      guid: [''],
      name: [''],
      presenterUrl: [''],
      password: [''],
      phoneNumber: [''],
      meetingId: [''],
      publicUrl: [''],
      details: [''],
      season: ['']
    });

    if (this.type === 'edit') {
      this.entity$ = this.at.params.pipe(
        map((params) => params.guid),
        filter((guid) => guid !== undefined),
        switchMap((guid) => this.bs.getEntity(guid))
      );

      this.entity$.pipe(take(1)).subscribe((entity) => {
        this.form.patchValue(entity);
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
    if (this.type === 'create') {
      this._createEntity();
    } else {
      this._updateEntity();
    }
  }

  public deleteEntity() {
    this.bs.deleteEntity(this.form.getRawValue().guid).subscribe({
      next: () => {
        this.ns.toast({
          id: 'delete-broadcast-success',
          title: 'Delete Broadcast',
          message: 'Broadcast deleted successfully.'
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'delete-broadcast-error',
          title: 'Delete Broadcast',
          message: `Error deleting broadcast: ${err.status}`
        });
      }
    });
  }

  private _updateEntity() {
    const rawValue = this.form.getRawValue();

    this.bs.updateEntity(rawValue.guid, rawValue).subscribe({
      next: () => {
        this.ns.toast({
          id: 'update-broadcast-success',
          title: 'Update Broadcast',
          message: 'Broadcast updated successfully.'
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'update-broadcast-error',
          title: 'Update Broadcast',
          message: `Error updating broadcast: ${err.status}`
        });
      }
    });
  }

  private _createEntity() {
    const rawValue = this.form.getRawValue();

    this.bs.createEntity(rawValue).subscribe({
      next: () => {
        this.ns.toast({
          id: 'create-broadcast-success',
          title: 'Create Broadcast',
          message: 'Broadcast created successfully.'
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'create-broadcast-error',
          title: 'Create Broadcast',
          message: `Error creating broadcast: ${err.status}`
        });
      }
    });
  }

  private _navigateBack() {
    this.rt.navigate(['/admin/broadcasts']);
  }
}
