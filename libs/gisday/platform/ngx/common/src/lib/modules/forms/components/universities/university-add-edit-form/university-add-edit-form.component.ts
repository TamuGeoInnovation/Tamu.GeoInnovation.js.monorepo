import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, filter, map, switchMap, take } from 'rxjs';

import { University } from '@tamu-gisc/gisday/platform/data-api';
import { UniversityService } from '@tamu-gisc/gisday/platform/ngx/data-access';

@Component({
  selector: 'tamu-gisc-university-add-edit-form',
  templateUrl: './university-add-edit-form.component.html',
  styleUrls: ['./university-add-edit-form.component.scss']
})
export class UniversityAddEditFormComponent implements OnInit {
  @Input()
  public type: 'create' | 'edit';

  public entity$: Observable<Partial<University>>;
  public form: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly rt: Router,
    private readonly at: ActivatedRoute,
    private readonly us: UniversityService
  ) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      guid: [null],
      name: [null],
      acronym: [null],
      hexTriplet: [null]
    });

    if (this.type === 'edit') {
      this.entity$ = this.at.params.pipe(
        map((params) => params.guid),
        filter((guid) => guid !== undefined),
        switchMap((guid) => this.us.getEntity(guid))
      );

      this.entity$.pipe(take(1)).subscribe((entity) => {
        this.form.patchValue(entity);
      });
    }
  }

  public setHexPreview() {
    return `#${this.form.controls.hexTriplet.value}`;
  }

  public handleSubmission() {
    if (this.type === 'create') {
      this._createEntity();
    } else {
      this._updateEntity();
    }
  }

  public deleteEntity() {
    this.us.deleteEntity(this.form.getRawValue().guid).subscribe(() => {
      this._navigateBack();
    });
  }

  private _updateEntity() {
    const rawValue = this.form.getRawValue();

    this.us.updateEntity(rawValue.guid, rawValue).subscribe(() => {
      this._navigateBack();
    });
  }

  private _createEntity() {
    const rawValue = this.form.getRawValue();

    this.us.createEntity(rawValue).subscribe(() => {
      this._navigateBack();
    });
  }

  private _navigateBack() {
    this.rt.navigate(['/admin/universities']);
  }
}

