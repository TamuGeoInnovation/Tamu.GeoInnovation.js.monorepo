import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable, filter, map, merge, shareReplay, switchMap, take } from 'rxjs';

import { Sponsor, Season } from '@tamu-gisc/gisday/platform/data-api';
import { AssetsService, SeasonService, SponsorService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { formToFormData } from '../../../../../utils/form-to-form-data';

@Component({
  selector: 'tamu-gisc-sponsor-add-edit-form',
  templateUrl: './sponsor-add-edit-form.component.html',
  styleUrls: ['./sponsor-add-edit-form.component.scss']
})
export class SponsorAddEditFormComponent implements OnInit {
  @Input()
  public type: 'create' | 'edit';

  public entity$: Observable<Partial<Sponsor>>;
  public activeSeasons$: Observable<Partial<Season>>;
  public logoUrl$: Observable<SafeUrl>;
  public form: FormGroup;

  public sponsorshipLevelsDict = [
    {
      value: 'raster',
      label: 'Raster'
    },
    {
      value: 'polygon',
      label: 'Polygon'
    },
    {
      value: 'line',
      label: 'Line'
    },
    {
      value: 'point',
      label: 'Point'
    }
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly at: ActivatedRoute,
    private readonly rt: Router,
    private readonly as: AssetsService,
    private readonly sss: SponsorService,
    private readonly ss: SeasonService,
    private readonly sn: DomSanitizer,
    private readonly ns: NotificationService
  ) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      guid: [null],
      name: [null],
      website: [null],
      description: [null],
      contactFirstName: [null],
      contactLastName: [null],
      contactEmail: [null],
      sponsorshipLevel: [null],
      season: [null],
      file: [null]
    });

    this.activeSeasons$ = this.ss.activeSeason$;

    this.entity$ = this.at.params.pipe(
      map((params) => params.guid),
      filter((guid) => guid !== undefined),
      switchMap((guid) => this.sss.getEntity(guid)),
      shareReplay()
    );

    // Image preview can come from two sources:
    // 1. The entity itself, if it has a photoUrl property
    // 2. The form, if the user has selected a file
    this.logoUrl$ = merge(
      this.entity$.pipe(
        filter((ent) => ent?.logo?.guid !== undefined && ent?.logo?.guid !== null),
        switchMap((entity) => {
          return this.as.getAssetUrl(entity?.logo?.guid);
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
    this.sss.deleteEntity(this.form.getRawValue().guid).subscribe({
      next: () => {
        this.ns.toast({
          id: 'sponsor-delete-success',
          title: 'Delete Sponsor',
          message: `Sponsor was successfully deleted.`
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'sponsor-delete-failed',
          title: 'Delete Sponsor',
          message: `Error deleting sponsor: ${err.status}`
        });
      }
    });
  }

  private _updateEntity() {
    const rawValue = this.form.getRawValue();
    const formData = formToFormData(this.form);

    this.sss.updateEntityFormData(rawValue.guid, formData).subscribe({
      next: () => {
        this.ns.toast({
          id: 'sponsor-update-success',
          title: 'Update Sponsor',
          message: `Sponsor was successfully updated.`
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'sponsor-update-failed',
          title: 'Update Sponsor',
          message: `Error updating sponsor: ${err.status}`
        });
      }
    });
  }

  private _createEntity() {
    const formData = formToFormData(this.form);

    this.sss.createEntityFormData(formData).subscribe({
      next: () => {
        this.ns.toast({
          id: 'sponsor-create-success',
          title: 'Create Sponsor',
          message: `Sponsor was successfully created.`
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'sponsor-create-failed',
          title: 'Create Sponsor',
          message: `Error creating sponsor: ${err.status}`
        });
      }
    });
  }

  private _navigateBack() {
    this.rt.navigate(['/admin/sponsors']);
  }
}

