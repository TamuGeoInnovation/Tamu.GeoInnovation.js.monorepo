import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, filter, map, switchMap, take } from 'rxjs';

import { Tag } from '@tamu-gisc/gisday/platform/data-api';
import { TagService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

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
    private readonly ts: TagService,
    private readonly ns: NotificationService
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
    this.ts.deleteEntity(this.form.getRawValue().guid).subscribe(
      () => {
        this.ns.toast({
          id: 'delete-tag-success',
          title: 'Delete tag',
          message: 'Tag deleted successfully.'
        });

        this._navigateBack();
      },
      (err) => {
        this.ns.toast({
          id: 'delete-tag-error',
          title: 'Delete tag',
          message: `Error deleting tag: ${err.status}`
        });
      }
    );
  }

  private _updateEntity() {
    const rawValue = this.form.getRawValue();

    this.ts.updateEntity(rawValue.guid, rawValue).subscribe(
      () => {
        this.ns.toast({
          id: 'update-tag-success',
          title: 'Update tag',
          message: 'Tag updated successfully.'
        });

        this._navigateBack();
      },
      (err) => {
        this.ns.toast({
          id: 'update-tag-error',
          title: 'Update tag',
          message: `Error updating tag: ${err.status}`
        });
      }
    );
  }

  private _createEntity() {
    const rawValue = this.form.getRawValue();

    this.ts.createEntity(rawValue).subscribe(
      () => {
        this.ns.toast({
          id: 'create-tag-success',
          title: 'Create tag',
          message: 'Tag created successfully.'
        });

        this._navigateBack();
      },
      (err) => {
        this.ns.toast({
          id: 'create-tag-error',
          title: 'Create tag',
          message: `Error creating tag: ${err.status}`
        });
      }
    );
  }

  private _navigateBack() {
    this.rt.navigate(['/admin/tags']);
  }
}
