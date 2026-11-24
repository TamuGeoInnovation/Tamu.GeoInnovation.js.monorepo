import { Component, OnInit, inject, input } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  Observable,
  combineLatest,
  distinctUntilChanged,
  filter,
  from,
  map,
  merge,
  of,
  race,
  shareReplay,
  startWith,
  switchMap,
  take
} from 'rxjs';

import { Organization, Speaker, University } from '@tamu-gisc/gisday/platform/data-api';
import {
  AssetsService,
  OrganizationService,
  SeasonService,
  SpeakerService,
  UniversityService
} from '@tamu-gisc/gisday/platform/ngx/data-access';

import { formToFormData } from '../../../../../utils/form-to-form-data';
import { UploadImagePicker } from '../../../../../utils/upload-image-picker';
import { classBannerSpeaker } from '../../../../../utils/speakers';
import { TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { FileComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { CheckboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { AsyncPipe } from '@angular/common';
import { SpeakerClassBannerComponent } from '../../../../people/components/speaker-class-banner/speaker-class-banner.component';
import { ImagePreviewComponent } from '../../../../images/components/image-preview/image-preview.component';
import { adminEntityForm } from '../../../admin-entity-form';

@Component({
  selector: 'tamu-gisc-speaker-add-edit-form',
  templateUrl: './speaker-add-edit-form.component.html',
  styleUrls: ['./speaker-add-edit-form.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TextboxComponent,
    FileComponent,
    SelectComponent,
    CheckboxComponent,
    ButtonComponent,
    AsyncPipe,
    SpeakerClassBannerComponent,
    ImagePreviewComponent
  ]
})
export class SpeakerAddEditFormComponent implements OnInit {
  private readonly fb = inject(UntypedFormBuilder);
  /** Its save and delete, and what they say (#3340, #3382). */
  private readonly saves = adminEntityForm('Speaker', '/admin/speakers');
  private readonly at = inject(ActivatedRoute);
  private readonly ss = inject(SpeakerService);
  private readonly as = inject(AssetsService);
  private readonly us = inject(UniversityService);
  private readonly os = inject(OrganizationService);
  private readonly sn = inject(DomSanitizer);
  private readonly sss = inject(SeasonService);

  public readonly type = input<'create' | 'edit'>(undefined);

  public entity$: Observable<Partial<Speaker>>;
  public universities$: Observable<Array<Partial<University>>>;
  public organizations$: Observable<Array<Partial<Organization>>>;
  public speakerPhotoUrl$: Observable<SafeUrl>;

  /**
   * The speaker as the banner on the photograph sees it: the university chosen in the form and the year
   * typed into it, so the banner shows what the public pages will once the form is saved.
   */
  public bannerSpeaker$: Observable<Partial<Speaker>>;

  public form: UntypedFormGroup;

  /** The photo picker, on the shared upload rule (#3074). */
  public readonly photoPicker = new UploadImagePicker('The photo', { shrink: true });

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

    this.universities$ = this.us.getEntitiesForActiveSeason().pipe(shareReplay(1));
    this.organizations$ = this.os.getEntitiesForActiveSeason();

    this.bannerSpeaker$ = combineLatest([
      this.form.valueChanges.pipe(startWith(this.form.getRawValue())),
      this.universities$.pipe(startWith([] as Array<Partial<University>>))
    ]).pipe(map(([value, universities]) => classBannerSpeaker(value.university, value.graduationYear, universities)));

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

    if (this.type() === 'edit') {
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
    if (this.type() === 'create') {
      this._createEntity();
    } else {
      this._updateEntity();
    }
  }

  /**
   * The form as it is sent, with the photo shrunk (#3177): sent as chosen, a photo over 8,000 pixels a side or 40
   * megapixels was refused with 413 however few bytes it was.
   */
  private _formData(): Observable<FormData> {
    const data = formToFormData(this.form);
    const photo = data.get('file');

    if (!(photo instanceof File)) {
      return of(data);
    }

    return from(this.photoPicker.ready(photo)).pipe(
      map((ready) => {
        data.set('file', ready, ready.name);
        return data;
      })
    );
  }

  private _createEntity() {
    this.saves.save('create', this._formData().pipe(switchMap((formData) => this.ss.insertSpeakerInfo(formData))));
  }

  private _updateEntity() {
    const formValue = this.form.getRawValue();

    this.saves.save('update', this._formData().pipe(switchMap((data) => this.ss.updateSpeakerInfo(formValue.guid, data))));
  }

  public deleteEntity() {
    this.saves.save('delete', this.ss.deleteEntity(this.form.getRawValue().guid));
  }

}
