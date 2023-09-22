import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, Observable, filter, map, of, shareReplay, switchMap } from 'rxjs';

import { Organization, Speaker, University } from '@tamu-gisc/gisday/platform/data-api';
import { OrganizationService, SpeakerService, UniversityService } from '@tamu-gisc/gisday/platform/ngx/data-access';

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
  public speakerPhoto$: Observable<SafeUrl>;

  public form: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly rt: Router,
    private readonly at: ActivatedRoute,
    private readonly ss: SpeakerService,
    private readonly us: UniversityService,
    private readonly os: OrganizationService,
    private readonly sn: DomSanitizer
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
      file: ['']
    });

    this.universities$ = this.us.getEntities();
    this.organizations$ = this.os.getEntities();

    this.entity$ = this.at.params.pipe(
      map((params) => params.guid),
      filter((guid) => guid !== undefined),
      switchMap((guid) => this.ss.getEntity(guid)),
      shareReplay()
    );

    this.speakerPhoto$ = this.entity$.pipe(
      switchMap((entity) => {
        if (entity?.image?.blob) {
          const byteArray = entity?.image.blob.data;

          const blob = new Blob([byteArray.buffer]);

          //createObjectURL && asign it to ur image src
          const url = URL.createObjectURL(blob);
          return of(this.sn.bypassSecurityTrustUrl(url));

          // const buffer = Buffer.from(byteArray as Uint8Array).toString('base64');
          // return of(`data:image/png;base64,${buffer}`);
        } else {
          return EMPTY;
        }
      })
    );

    if (this.type === 'edit') {
      this.entity$.subscribe((entity) => {
        this.form.patchValue({
          ...entity,
          organization: entity?.organization?.guid,
          university: entity?.university?.guid
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

    this.ss.insertSpeakerInfo(formData).subscribe(() => {
      this._navigateBack();
    });
  }

  private _updateEntity() {
    const formValue = this.form.getRawValue();
    const data = formToFormData(this.form);

    this.ss.updateSpeakerInfo(formValue.guid, data).subscribe(() => {
      this._navigateBack();
    });
  }

  public deleteEntity() {
    this.ss.deleteEntity(this.form.getRawValue().guid).subscribe(() => {
      this._navigateBack();
    });
  }

  private _navigateBack() {
    this.rt.navigate(['/admin/speakers']);
  }
}

