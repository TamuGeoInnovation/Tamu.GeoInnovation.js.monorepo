import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, filter, map, switchMap, take } from 'rxjs';

import { University } from '@tamu-gisc/gisday/platform/data-api';
import { UniversityService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

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
    private readonly us: UniversityService,
    private readonly ns: NotificationService
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
    this.us.deleteEntity(this.form.getRawValue().guid).subscribe({
      next: () => {
        this.ns.toast({
          id: 'university-delete',
          title: 'Delete University',
          message: `University deleted successfully`
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'university-delete-error',
          title: 'Delete University',
          message: `Error deleting university: ${err.status}`
        });
      }
    });
  }

  private _updateEntity() {
    const rawValue = this.form.getRawValue();

    this.us.updateEntity(rawValue.guid, rawValue).subscribe({
      next: () => {
        this.ns.toast({
          id: 'university-update',
          title: 'Update University',
          message: `University updated successfully`
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'university-update-error',
          title: 'Update University',
          message: `Error updating university: ${err.status}`
        });
      }
    });
  }

  private _createEntity() {
    const rawValue = this.form.getRawValue();

    this.us.createEntity(rawValue).subscribe({
      next: () => {
        this.ns.toast({
          id: 'university-create',
          title: 'Create University',
          message: `University created successfully`
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'university-create-error',
          title: 'Create University',
          message: `Error creating university: ${err.status}`
        });
      }
    });
  }

  private _navigateBack() {
    this.rt.navigate(['/admin/universities']);
  }
}
