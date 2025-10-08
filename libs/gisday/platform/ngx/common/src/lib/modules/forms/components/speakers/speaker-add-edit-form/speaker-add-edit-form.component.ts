import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, distinctUntilChanged, filter, map, merge, of, race, shareReplay, switchMap, take } from 'rxjs';

import { Organization, Speaker, University } from '@tamu-gisc/gisday/platform/data-api';
import {
  AssetsService,
  OrganizationService,
  SeasonService,
  SpeakerService,
  UniversityService
} from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { formToFormData } from '../../../../../utils/form-to-form-data';

@Component({
  selector: 'tamu-gisc-speaker-add-edit-form',
  templateUrl: './speaker-add-edit-form.component.html',
  styleUrls: ['./speaker-add-edit-form.component.scss']
})
export class SpeakerAddEditFormComponent implements OnInit {
  @Input()
  public type: 'create' | 'edit';

  public entity$: Observable<Partial<Speaker>>;
  public universities$: Observable<Array<Partial<University>>>;
  public organizations$: Observable<Array<Partial<Organization>>>;
  public speakerPhotoUrl$: Observable<SafeUrl>;

  public form: UntypedFormGroup;

  constructor(
    private readonly fb: UntypedFormBuilder,
    private readonly rt: Router,
    private readonly at: ActivatedRoute,
    private readonly ss: SpeakerService,
    private readonly as: AssetsService,
    private readonly us: UniversityService,
    private readonly os: OrganizationService,
    private readonly sn: DomSanitizer,
    private readonly ns: NotificationService,
    private readonly sss: SeasonService
  ) {}

  public ngOnInit() {
    this.form = this.fb.group({
      guid: [''],
      firstName: [''],
      lastName: [''],
      email: [''],
      organization: [null],
      university: [null],
      graduationYear: [''],
      degree: [''],
      program: [''],
      affiliation: [''],
      description: [''],
      socialMedia: [''],
      isOrganizer: [false],
      isActive: [false],
      file: [null],
      season: [null]
    });

    this.universities$ = this.us.getEntitiesForActiveSeason();
    this.organizations$ = this.os.getEntitiesForActiveSeason();

    this.entity$ = this.at.params.pipe(
      map((params) => params.guid),
      filter((guid) => guid !== undefined),
      switchMap((guid) => this.ss.getEntity(guid)),
      shareReplay(1)
    );

    const speakerImageFromEntity$ = this.entity$.pipe(
      switchMap((ent) => {
        if (ent?.images?.[0]?.guid !== undefined && ent?.images?.[0]?.guid !== null) {
          return this.as.getAssetUrl(ent?.images?.[0]?.path);
        } else {
          return of(null);
        }
      }),
      shareReplay(1)
    );

    // Image preview can come from two sources:
    // 1. The entity itself, if it has a photoUrl property
    // 2. The form, if the user has selected a file
    this.speakerPhotoUrl$ = merge(
      speakerImageFromEntity$,
      this.form.get('file').valueChanges.pipe(
        distinctUntilChanged(),
        switchMap((file) => {
          if (file !== null) {
            return of(this.sn.bypassSecurityTrustUrl(URL.createObjectURL(file)));
          } else {
            this.form.get('file').reset();
            // speakerImageFromEntity$ relies on the entity resolving which will not happen in a "create" state, and so we need to return a null value when the entity is not resolved.
            return race(speakerImageFromEntity$, of(null));
          }
        })
      )
    );

    if (this.type === 'edit') {
      this.entity$.subscribe((entity) => {
        this.form.patchValue({
          ...entity,
          organization: entity?.organization?.guid,
          university: entity?.university?.guid,
          isOrganizer: entity?.isOrganizer === true,
          isActive: entity?.isActive === true
        });

        // If the entity has a season, remove the season control from the form
        this.form.removeControl('season');
      });
    } else {
      this.sss.activeSeason$.pipe(take(1)).subscribe((season) => {
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

  private _createEntity() {
    const formData = formToFormData(this.form);

    this.ss.insertSpeakerInfo(formData).subscribe({
      next: () => {
        this.ns.toast({
          id: 'speaker-create-success',
          title: 'Create Speaker',
          message: `Speaker was successfully created.`
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'speaker-create-failed',
          title: 'Create Speaker',
          message: `Error creating speaker: ${err.status}`
        });
      }
    });
  }

  private _updateEntity() {
    const formValue = this.form.getRawValue();
    const data = formToFormData(this.form);

    this.ss.updateSpeakerInfo(formValue.guid, data).subscribe({
      next: () => {
        this.ns.toast({
          id: 'speaker-update-success',
          title: 'Update Speaker',
          message: `Speaker was successfully updated.`
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'speaker-update-failed',
          title: 'Update Speaker',
          message: `Error updating speaker: ${err.status}`
        });
      }
    });
  }

  public deleteEntity() {
    this.ss.deleteEntity(this.form.getRawValue().guid).subscribe({
      next: () => {
        this.ns.toast({
          id: 'speaker-delete-success',
          title: 'Delete Speaker',
          message: `Speaker was successfully deleted.`
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'speaker-delete-failed',
          title: 'Delete Speaker',
          message: `Error deleting speaker: ${err.status}`
        });
      }
    });
  }

  private _navigateBack() {
    this.rt.navigate(['/admin/speakers']);
  }
}
