import { Component, OnInit, inject, input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable, filter, map, of, shareReplay, switchMap, take } from 'rxjs';

import { Sponsor, Season } from '@tamu-gisc/gisday/platform/data-api';
import { AssetsService, SeasonService, SponsorService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { serverMessage } from '../../../../../utils/server-message';
import { UploadImagePicker } from '../../../../../utils/upload-image-picker';

import { formToFormData } from '../../../../../utils/form-to-form-data';
import { SPONSOR_LOGO_SIZES } from '../../../../../utils/sponsor-logo-size';
import { TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { FileComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { CheckboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { AsyncPipe } from '@angular/common';
import { ImagePreviewComponent } from '../../../../images/components/image-preview/image-preview.component';
import { uploadPreviewUrl } from '../../../../images/upload-preview-url';
import { injectBackToList } from '../../../admin-details-page';

@Component({
  selector: 'tamu-gisc-sponsor-add-edit-form',
  templateUrl: './sponsor-add-edit-form.component.html',
  styleUrls: ['./sponsor-add-edit-form.component.scss'],
  imports: [
    ImagePreviewComponent,
    FormsModule,
    ReactiveFormsModule,
    TextboxComponent,
    SelectComponent,
    FileComponent,
    ButtonComponent,
    CheckboxComponent,
    AsyncPipe
  ]
})
export class SponsorAddEditFormComponent implements OnInit {
  private readonly fb = inject(UntypedFormBuilder);
  private readonly at = inject(ActivatedRoute);
  /** Leaves for the list once a save, create or delete has worked: the one the page was opened from (#2965). */
  private readonly backToList = injectBackToList('/admin/sponsors');
  private readonly as = inject(AssetsService);
  private readonly sss = inject(SponsorService);
  private readonly ss = inject(SeasonService);
  private readonly sn = inject(DomSanitizer);
  private readonly ns = inject(NotificationService);

  public readonly type = input<'create' | 'edit'>(undefined);

  public entity$: Observable<Partial<Sponsor>>;
  public activeSeasons$: Observable<Partial<Season>>;
  public logoUrl$: Observable<SafeUrl | string | null>;
  public form: UntypedFormGroup;

  /** The logo picker, on the shared upload rule (#3009, #3074). */
  public readonly logo = new UploadImagePicker('The logo');

  public logoSizesDict = SPONSOR_LOGO_SIZES;

  public sponsorshipLevelsDict = [
    {
      value: 'lidar',
      label: 'LiDAR'
    },
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
      active: [true],
      logoSize: ['regular'],
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

    // The chosen logo, else the saved one, else nothing (#2569); drawn by tamu-gisc-image-preview, never a broken image.
    this.logoUrl$ = uploadPreviewUrl(
      (this.entity$ ?? of(null)).pipe(
        switchMap((entity) => (entity?.logos?.[0]?.path ? this.as.getAssetUrl(entity.logos[0].path) : of(null)))
      ),
      this.form.get('file').valueChanges,
      this.sn
    );

    if (this.type() === 'edit') {
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
    if (this.type() === 'create') {
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
          message: serverMessage(err, `Error deleting sponsor: ${err.status}`)
        });
      }
    });
  }

  private _updateEntity() {
    const rawValue = this.form.getRawValue();
    // `active` is sent whether on or off (#1962, #3327), so switching a sponsor off is saved.
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
          message: serverMessage(err, `Error updating sponsor: ${err.status}`)
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
          message: serverMessage(err, `Error creating sponsor: ${err.status}`)
        });
      }
    });
  }

  private _navigateBack() {
    this.backToList();
  }
}
