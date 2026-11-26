import { Component, OnInit, inject, input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, filter, map, switchMap, take } from 'rxjs';

import { University } from '@tamu-gisc/gisday/platform/data-api';
import { SeasonService, UniversityService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';

import { adminEntityForm } from '../../../admin-entity-form';

@Component({
  selector: 'tamu-gisc-university-add-edit-form',
  templateUrl: './university-add-edit-form.component.html',
  styleUrls: ['./university-add-edit-form.component.scss'],
  imports: [FormsModule, ReactiveFormsModule, TextboxComponent, ButtonComponent]
})
export class UniversityAddEditFormComponent implements OnInit {
  private readonly fb = inject(UntypedFormBuilder);
  /** Its save and delete, and what they say (#3340). */
  private readonly saves = adminEntityForm('University', '/admin/universities');
  private readonly at = inject(ActivatedRoute);
  private readonly us = inject(UniversityService);
  private readonly ss = inject(SeasonService);

  public readonly type = input.required<'create' | 'edit'>();

  public entity$: Observable<Partial<University>>;
  public form: UntypedFormGroup;

  public ngOnInit(): void {
    this.form = this.fb.group({
      guid: [null],
      name: [null],
      acronym: [null],
      hexTriplet: [null],
      season: [null]
    });

    if (this.type() === 'edit') {
      this.entity$ = this.at.params.pipe(
        map((params) => params.guid),
        filter((guid) => guid !== undefined),
        switchMap((guid) => this.us.getEntity(guid))
      );

      this.entity$.pipe(take(1)).subscribe((entity) => {
        this.form.patchValue(entity);

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
  }

  public setHexPreview() {
    return `#${this.form.controls.hexTriplet.value}`;
  }

  public handleSubmission() {
    if (this.type() === 'create') {
      this._createEntity();
    } else {
      this._updateEntity();
    }
  }

  public deleteEntity() {
    this.saves.save('delete', this.us.deleteEntity(this.form.getRawValue().guid));
  }

  private _updateEntity() {
    const rawValue = this.form.getRawValue();

    this.saves.save('update', this.us.updateEntity(rawValue.guid, rawValue));
  }

  private _createEntity() {
    const rawValue = this.form.getRawValue();

    this.saves.save('create', this.us.createEntity(rawValue));
  }
}
