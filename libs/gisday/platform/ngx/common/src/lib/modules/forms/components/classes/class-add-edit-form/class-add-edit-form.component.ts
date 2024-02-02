import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, filter, map, shareReplay, switchMap, take } from 'rxjs';

import { Class, Season, UserClass } from '@tamu-gisc/gisday/platform/data-api';
import { ClassService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

@Component({
  selector: 'tamu-gisc-class-add-edit-form',
  templateUrl: './class-add-edit-form.component.html',
  styleUrls: ['./class-add-edit-form.component.scss']
})
export class ClassAddEditFormComponent implements OnInit {
  @Input()
  public type: 'create' | 'edit';

  public entity$: Observable<Partial<Class>>;
  public activeSeasons$: Observable<Partial<Season>>;
  public students$: Observable<Array<Partial<UserClass>>>;
  public form: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly at: ActivatedRoute,
    private readonly rt: Router,
    private readonly cs: ClassService,
    private readonly ss: SeasonService,
    private readonly ns: NotificationService
  ) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      guid: [null],
      title: [null],
      number: [null],
      code: [null],
      professorName: [null],
      season: [null]
    });

    this.activeSeasons$ = this.ss.activeSeason$;

    this.entity$ = this.at.params.pipe(
      map((params) => params.guid),
      filter((guid) => guid !== undefined),
      switchMap((guid) => this.cs.getEntity(guid)),
      shareReplay()
    );

    if (this.type === 'edit') {
      this.entity$.pipe(take(1)).subscribe((entity) => {
        this.form.patchValue({
          ...entity,
          season: entity?.season?.guid
        });
      });
    } else {
      this.activeSeasons$.pipe(take(1)).subscribe((season) => {
        this.form.patchValue({ season: season.guid });
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
    this.cs.deleteEntity(this.form.getRawValue().guid).subscribe({
      next: () => {
        this.ns.toast({
          id: 'class-delete-success',
          title: 'Delete class',
          message: `Class was successfully deleted.`
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'class-delete-failed',
          title: 'Delete class',
          message: `Error deleting class: ${err.status}`
        });
      }
    });
  }

  private _updateEntity() {
    const rawValue = this.form.getRawValue();

    this.cs.updateEntity(rawValue.guid, rawValue).subscribe({
      next: () => {
        this.ns.toast({
          id: 'class-update-success',
          title: 'Update class',
          message: `Class was successfully updated.`
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'class-update-failed',
          title: 'Update class',
          message: `Error updating class: ${err.status}`
        });
      }
    });
  }

  private _createEntity() {
    const rawValue = this.form.getRawValue();

    this.cs.createEntity(rawValue).subscribe({
      next: () => {
        this.ns.toast({
          id: 'class-create-success',
          title: 'Create class',
          message: `Class was successfully created.`
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'class-create-failed',
          title: 'Create class',
          message: `Error creating class: ${err.status}`
        });
      }
    });
  }

  private _navigateBack() {
    this.rt.navigate(['/admin/classes']);
  }
}
