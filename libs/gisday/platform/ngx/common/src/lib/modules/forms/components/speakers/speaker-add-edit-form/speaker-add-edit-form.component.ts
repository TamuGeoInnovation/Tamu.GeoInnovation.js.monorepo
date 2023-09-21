import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, filter, map, switchMap } from 'rxjs';

import { Speaker, University } from '@tamu-gisc/gisday/platform/data-api';
import { SpeakerService, UniversityService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { formToFormData } from '@tamu-gisc/gisday/platform/ngx/common';

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
  public speakerPhoto$: Observable<string>;

  public form: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly rt: ActivatedRoute,
    private readonly ss: SpeakerService,
    private readonly us: UniversityService
  ) {}

  public ngOnInit() {
    this.universities$ = this.us.getEntities();
    this.form = this.fb.group({
      guid: [''],
      firstName: [''],
      lastName: [''],
      email: [''],
      organization: [''],
      speakerInfo: this.fb.group({
        graduationYear: [''],
        degree: [''],
        program: [''],
        affiliation: [''],
        description: [''],
        socialMedia: [''],
        file: [''],
        university: ['']
      })
    });

    if (this.type === 'create') {
      this.entity$ = this.rt.params.pipe(
        map((params) => params.guid),
        filter((guid) => guid !== undefined),
        switchMap((guid) => this.ss.getEntity(guid))
      );
    }

    this.speakerPhoto$ = this.entity$.pipe(
      map((entity) => {
        if (!entity.speakerInfo.blob) {
          throw new Error('Entity does not contain blob data');
        }
        const byteArray = entity.speakerInfo.blob.data;
        const buffer = Buffer.from(byteArray as Uint8Array).toString('base64');
        return `data:image/png;base64,${buffer}`;
      })
    );
  }

  public handleSubmission() {
    if (this.type === 'create') {
      this._createEntity();
    } else {
      this._updateEntity();
    }
  }

  private _updateEntity() {
    const data = formToFormData(this.form);
    this.ss.updateSpeakerInfo(data).subscribe((result) => {
      console.log(result);
    });
  }

  private _createEntity() {
    const formData = formToFormData(this.form);

    this.ss.insertSpeakerInfo(formData);
  }
}

