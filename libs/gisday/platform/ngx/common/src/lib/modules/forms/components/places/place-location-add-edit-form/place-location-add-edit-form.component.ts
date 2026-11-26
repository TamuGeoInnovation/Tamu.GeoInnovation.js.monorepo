import { Component, OnInit, inject, input, signal } from '@angular/core';
import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable, filter, map, of, shareReplay, switchMap, take } from 'rxjs';

import { Place, PlaceLink } from '@tamu-gisc/gisday/platform/data-api';
import { AssetsService, PlaceService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';

import { formToFormData } from '../../../../../utils/form-to-form-data';
import { UploadImagePicker } from '../../../../../utils/upload-image-picker';
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
import { adminEntityForm } from '../../../admin-entity-form';

@Component({
  selector: 'tamu-gisc-place-location-add-edit-form',
  templateUrl: './place-location-add-edit-form.component.html',
  styleUrls: ['./place-location-add-edit-form.component.scss'],
  imports: [
    ImagePreviewComponent,
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
  /** Its save and delete, and what they say (#3340, #3382): as an Organization, as the form, its button and the admin menu call a place (#3398). */
  private readonly saves = adminEntityForm('Organization', '/admin/places');
  private readonly as = inject(AssetsService);
  private readonly ps = inject(PlaceService);
  private readonly sn = inject(DomSanitizer);
  private readonly ss = inject(SeasonService);

  public readonly type = input.required<'create' | 'edit'>();

  public form: UntypedFormGroup;

  /** The logo picker, on the shared upload rule (#3074). */
  public readonly logo = new UploadImagePicker('The logo');

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
        const links = entity?.links?.map((link) => this._createOrgLink(link)) ?? [];

        this.form.patchValue({ ...entity });

        links.forEach((l) => (this.form.get('links') as UntypedFormArray).push(l));
        this._syncLinks();

        // If the entity has a season, remove the season control from the form
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

    // The chosen logo, else the saved one, else nothing (#2569); drawn by tamu-gisc-image-preview, never a broken image.
    this.logoUrl$ = uploadPreviewUrl(
      (this.entity$ ?? of(null)).pipe(
        switchMap((entity) => (entity?.logos?.[0]?.path ? this.as.getAssetUrl(entity.logos[0].path) : of(null)))
      ),
      this.form.controls.file.valueChanges,
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
    this.saves.save('delete', this.ps.deleteEntity(this.form.getRawValue().guid));
  }

  public addOrgLink() {
    const control = this._createOrgLink();

    (this.form.get('links') as UntypedFormArray).push(control);
    this._syncLinks();
    // Changed by a click rather than typed, and still a change not yet saved (#2942).
    this.form.markAsDirty();
  }

  public removeOrgLink(index: number) {
    (this.form.get('links') as UntypedFormArray).removeAt(index);
    this._syncLinks();
    this.form.markAsDirty();
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

    this.saves.save('update', this.ps.updateEntityFormData(rawValue.guid, formData));
  }

  private _createEntity() {
    const formData = formToFormData(this.form, true);

    this.saves.save('create', this.ps.createEntityFormData(formData));
  }
}
