import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, filter, map, switchMap, take } from 'rxjs';

import { Tag } from '@tamu-gisc/gisday/platform/data-api';
import { TagService } from '@tamu-gisc/gisday/platform/ngx/data-access';

@Component({
  selector: 'tamu-gisc-tag-add-edit-form',
  templateUrl: './tag-add-edit-form.component.html',
  styleUrls: ['./tag-add-edit-form.component.scss']
})
export class TagAddEditFormComponent implements OnInit {
  @Input()
  public type: 'create' | 'edit';

  public entity$: Observable<Partial<Tag>>;
  public form: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly rt: Router,
    private readonly at: ActivatedRoute,
    private readonly ts: TagService
  ) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      guid: [''],
      name: ['']
    });

    if (this.type === 'edit') {
      this.entity$ = this.at.params.pipe(
        map((params) => params.guid),
        filter((guid) => guid !== undefined),
        switchMap((guid) => this.ts.getEntity(guid))
      );

      this.entity$.pipe(take(1)).subscribe((entity) => {
        this.form.patchValue(entity);
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
    this.ts.deleteEntity(this.form.getRawValue().guid).subscribe(() => {
      this._navigateBack();
    });
  }

  private _updateEntity() {
    const rawValue = this.form.getRawValue();

    this.ts.updateEntity(rawValue.guid, rawValue).subscribe(() => {
      this._navigateBack();
    });
  }

  private _createEntity() {
    const rawValue = this.form.getRawValue();

    this.ts.createEntity(rawValue).subscribe(() => {
      this._navigateBack();
    });
  }

  private _navigateBack() {
    this.rt.navigate(['/admin/tags']);
  }
}

