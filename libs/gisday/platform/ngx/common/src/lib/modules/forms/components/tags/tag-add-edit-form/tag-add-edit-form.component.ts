import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, filter, map, switchMap, take } from 'rxjs';

import { Tag } from '@tamu-gisc/gisday/platform/data-api';
import { SeasonService, TagService } from '@tamu-gisc/gisday/platform/ngx/data-access';
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
    private readonly ns: NotificationService,
    private readonly ss: SeasonService
  ) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      guid: [''],
      name: [''],
      season: [null]
    });

    if (this.type === 'edit') {
      this.entity$ = this.at.params.pipe(
        map((params) => params.guid),
        filter((guid) => guid !== undefined),
        switchMap((guid) => this.ts.getEntity(guid))
      );

      this.entity$.pipe(take(1)).subscribe((entity) => {
        this.form.patchValue(entity);

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
  }

  public handleSubmission() {
    if (this.type === 'create') {
      this._createEntity();
    } else {
      this._updateEntity();
    }
  }

  public deleteEntity() {
    this.ts.deleteEntity(this.form.getRawValue().guid).subscribe({
      next: () => {
        this.ns.toast({
          id: 'delete-tag-success',
          title: 'Delete Tag',
          message: 'Tag deleted successfully.'
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'delete-tag-error',
          title: 'Delete Tag',
          message: `Error deleting tag: ${err.status}`
        });
      }
    });
  }

  private _updateEntity() {
    const rawValue = this.form.getRawValue();

    this.ts.updateEntity(rawValue.guid, rawValue).subscribe({
      next: () => {
        this.ns.toast({
          id: 'update-tag-success',
          title: 'Update Tag',
          message: 'Tag updated successfully.'
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'update-tag-error',
          title: 'Update Tag',
          message: `Error updating tag: ${err.status}`
        });
      }
    });
  }

  private _createEntity() {
    const rawValue = this.form.getRawValue();

    this.ts.createEntity(rawValue).subscribe({
      next: () => {
        this.ns.toast({
          id: 'create-tag-success',
          title: 'Create Tag',
          message: 'Tag created successfully.'
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'create-tag-error',
          title: 'Create Tag',
          message: `Error creating tag: ${err.status}`
        });
      }
    });
  }

  private _navigateBack() {
    this.rt.navigate(['/admin/tags']);
  }
}
