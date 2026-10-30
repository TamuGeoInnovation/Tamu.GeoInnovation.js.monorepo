import { Component, OnInit, inject, input, signal } from '@angular/core';
import { AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable, filter, map, of, shareReplay, switchMap, take } from 'rxjs';

import { Place, PlaceLink } from '@tamu-gisc/gisday/platform/data-api';
import { AssetsService, PlaceService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { formToFormData } from '../../../../../utils/form-to-form-data';
import { PlaceVisibilityOptions } from '../../../../../enums/place-visibility-options.enum';
import { TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { FileComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { CheckboxGroupComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { CheckboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { PlaceLinkFormComponent } from '../place-link-form/place-link-form.component';
import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { AsyncPipe } from '@angular/common';
import { ImagePreviewComponent } from '../../../../images/components/image-preview/image-preview.component';
import { uploadPreviewUrl } from '../../../../images/upload-preview-url';

@Component({
  selector: 'tamu-gisc-place-location-add-edit-form',
  templateUrl: './place-location-add-edit-form.component.html',
  styleUrls: ['./place-location-add-edit-form.component.scss'],
  imports: [ImagePreviewComponent, 
    FormsModule,
    ReactiveFormsModule,
    TextboxComponent,
    FileComponent,
    CheckboxGroupComponent,
    CheckboxComponent,
    PlaceLinkFormComponent,
    ButtonComponent,
    AsyncPipe
  ]
})
export class PlaceLocationAddEditFormComponent implements OnInit {
  private readonly fb = inject(UntypedFormBuilder);
  private readonly at = inject(ActivatedRoute);
  private readonly rt = inject(Router);
  private readonly as = inject(AssetsService);
  private readonly ps = inject(PlaceService);
  private readonly sn = inject(DomSanitizer);
  private readonly ns = inject(NotificationService);
  private readonly ss = inject(SeasonService);

  public readonly type = input<'create' | 'edit'>(undefined);

  public form: UntypedFormGroup;

  /**
   * The link controls, as a new list whenever a link is added or removed.
   */
  public readonly links = signal<Array<AbstractControl>>([]);

  public entity$: Observable<Partial<Place>>;
  public logoUrl$: Observable<SafeUrl | string | null>;

  public visibilitySettingsOptions = [
    { label: 'Header', value: PlaceVisibilityOptions.Header },
    { label: 'Footer', value: PlaceVisibilityOptions.Footer },
    { label: 'About Page', value: PlaceVisibilityOptions.OrgPage },
    { label: 'Sessions Filter', value: PlaceVisibilityOptions.SessionsFilter }
  ];

  public ngOnInit(): void {
    this.form = this.fb.group({
      guid: [null],
      name: [null],
      address: [null],
      city: [null],
      state: [null],
      zip: [null],
      website: [null],
      links: this.fb.array([]),
      file: [null],
      visibilitySettings: [null],
      season: [null]
    });

    if (this.type() === 'edit') {
      this.entity$ = this.at.params.pipe(
        map((params) => params.guid),
        filter((guid) => guid !== undefined),
        switchMap((guid) => this.ps.getEntity(guid)),
        shareReplay(1)
      );

      this.entity$.pipe(take(1)).subscribe((entity) => {
        const links = entity?.links?.map((link) => this._createOrgLink(link));

        this.form.patchValue({ ...entity });

        links.forEach((l) => (this.form.get('links') as UntypedFormArray).push(l));
        this._syncLinks();

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

    // The chosen logo, else the saved one, else nothing (#2569); drawn by tamu-gisc-image-preview, never a broken image.
    this.logoUrl$ = uploadPreviewUrl(
      (this.entity$ ?? of(null)).pipe(
        switchMap((entity) => (entity?.logos?.[0]?.path ? this.as.getAssetUrl(entity.logos[0].path) : of(null)))
      ),
      this.form.get('file').valueChanges,
      this.sn
    );
  }

  public handleSubmission() {
    if (this.type() === 'create') {
      this._createEntity();
    } else {
      this._updateEntity();
    }
  }

  public deleteEntity() {
    this.ps.deleteEntity(this.form.getRawValue().guid).subscribe({
      next: () => {
        this.ns.toast({
          id: 'place-delete-success',
          title: 'Delete Place',
          message: `Place was successfully deleted.`
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'place-delete-failed',
          title: 'Delete Place',
          message: `Error deleting place: ${err.status}`
        });
      }
    });
  }

  public addOrgLink() {
    const control = this._createOrgLink();

    (this.form.get('links') as UntypedFormArray).push(control);
    this._syncLinks();
  }

  public removeOrgLink(index: number) {
    (this.form.get('links') as UntypedFormArray).removeAt(index);
    this._syncLinks();
  }

  private _syncLinks() {
    this.links.set([...(this.form.get('links') as UntypedFormArray).controls]);
  }

  private _createOrgLink(values?: Partial<PlaceLink>) {
    return this.fb.control({
      guid: values?.guid || null,
      label: values?.label || null,
      url: values?.url || null
    });
  }

  private _updateEntity() {
    const rawValue = this.form.getRawValue();
    const formData = formToFormData(this.form, true);

    this.ps.updateEntityFormData(rawValue.guid, formData).subscribe({
      next: () => {
        this.ns.toast({
          id: 'place-update-success',
          title: 'Update Place',
          message: `Place was successfully updated.`
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'place-update-failed',
          title: 'Update Place',
          message: `Error updating place: ${err.status}`
        });
      }
    });
  }

  private _createEntity() {
    const formData = formToFormData(this.form, true);

    this.ps.createEntityFormData(formData).subscribe({
      next: () => {
        this.ns.toast({
          id: 'place-create-success',
          title: 'Create Place',
          message: `Place was successfully created.`
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'place-create-failed',
          title: 'Create Place',
          message: `Error creating place: ${err.status}`
        });
      }
    });
  }

  private _navigateBack() {
    this.rt.navigate(['/admin/places']);
  }
}
