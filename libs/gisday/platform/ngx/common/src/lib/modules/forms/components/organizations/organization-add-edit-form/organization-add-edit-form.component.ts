import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable, filter, map, merge, shareReplay, switchMap, take } from 'rxjs';

import { Organization, Season } from '@tamu-gisc/gisday/platform/data-api';
import { AssetsService, OrganizationService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { formToFormData } from '../../../../../utils/form-to-form-data';

@Component({
  selector: 'tamu-gisc-organization-add-edit-form',
  templateUrl: './organization-add-edit-form.component.html',
  styleUrls: ['./organization-add-edit-form.component.scss']
})
export class OrganizationAddEditFormComponent implements OnInit {
  @Input()
  public type: 'create' | 'edit';

  public entity$: Observable<Partial<Organization>>;
  public activeSeasons$: Observable<Partial<Season>>;
  public logoUrl$: Observable<SafeUrl>;
  public form: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly at: ActivatedRoute,
    private readonly rt: Router,
    private readonly as: AssetsService,
    private readonly os: OrganizationService,
    private readonly ss: SeasonService,
    private readonly sn: DomSanitizer,
    private readonly ns: NotificationService
  ) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      guid: [null],
      name: [null],
      acronym: [null],
      website: [null],
      text: [null],
      contactFirstName: [null],
      contactLastName: [null],
      contactEmail: [null],
      season: [null],
      file: [null]
    });

    this.activeSeasons$ = this.ss.activeSeason$;

    this.entity$ = this.at.params.pipe(
      map((params) => params.guid),
      filter((guid) => guid !== undefined),
      switchMap((guid) => this.os.getEntity(guid)),
      shareReplay()
    );

    // Image preview can come from two sources:
    // 1. The entity itself, if it has a photoUrl property
    // 2. The form, if the user has selected a file
    this.logoUrl$ = merge(
      this.entity$.pipe(
        filter((ent) => ent?.logos?.[0]?.guid !== undefined && ent?.logos?.[0]?.guid !== null),
        switchMap((entity) => {
          return this.as.getAssetUrl(entity?.logos?.[0]?.guid);
        })
      ),
      this.form.valueChanges.pipe(
        map((value) => value.file),
        filter((file) => file !== null),
        map((file) => this.sn.bypassSecurityTrustUrl(URL.createObjectURL(file)))
      )
    );

    if (this.type === 'edit') {
      this.entity$.pipe(take(1)).subscribe((entity) => {
        this.form.patchValue({
          ...entity,
          season: entity?.season?.guid
        });
      });
    } else {
      this.activeSeasons$.pipe(take(1)).subscribe((season) => {
        this.form.patchValue({ season: season.guid });
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
    this.os.deleteEntity(this.form.getRawValue().guid).subscribe({
      next: () => {
        this.ns.toast({
          id: 'org-delete-success',
          title: 'Delete organization',
          message: `Organization was successfully deleted.`
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'org-delete-failed',
          title: 'Delete organization',
          message: `Error deleting organization: ${err.status}`
        });
      }
    });
  }

  private _updateEntity() {
    const rawValue = this.form.getRawValue();
    const formData = formToFormData(this.form);

    this.os.updateEntityFormData(rawValue.guid, formData).subscribe({
      next: () => {
        this.ns.toast({
          id: 'org-update-success',
          title: 'Update organization',
          message: `Organization was successfully updated.`
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'org-update-failed',
          title: 'Update organization',
          message: `Error updating organization: ${err.status}`
        });
      }
    });
  }

  private _createEntity() {
    const formData = formToFormData(this.form);

    this.os.createEntityFormData(formData).subscribe({
      next: () => {
        this.ns.toast({
          id: 'org-create-success',
          title: 'Create organization',
          message: `Organization was successfully created.`
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'org-create-failed',
          title: 'Create organization',
          message: `Error creating organization: ${err.status}`
        });
      }
    });
  }

  private _navigateBack() {
    this.rt.navigate(['/admin/organizations']);
  }
}
