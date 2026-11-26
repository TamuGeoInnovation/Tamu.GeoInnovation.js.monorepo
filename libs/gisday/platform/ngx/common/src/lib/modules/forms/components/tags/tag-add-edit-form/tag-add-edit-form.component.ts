import { Component, OnInit, inject, input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, filter, map, switchMap, take } from 'rxjs';

import { Tag } from '@tamu-gisc/gisday/platform/data-api';
import { SeasonService, TagService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';

import { adminEntityForm } from '../../../admin-entity-form';

@Component({
  selector: 'tamu-gisc-tag-add-edit-form',
  templateUrl: './tag-add-edit-form.component.html',
  styleUrls: ['./tag-add-edit-form.component.scss'],
  imports: [FormsModule, ReactiveFormsModule, TextboxComponent, ButtonComponent]
})
export class TagAddEditFormComponent implements OnInit {
  private readonly fb = inject(UntypedFormBuilder);
  /** Its save and delete, and what they say (#3340). */
  private readonly saves = adminEntityForm('Tag', '/admin/tags');
  private readonly at = inject(ActivatedRoute);
  private readonly ts = inject(TagService);
  private readonly ss = inject(SeasonService);

  public readonly type = input.required<'create' | 'edit'>();

  public entity$: Observable<Partial<Tag>>;
  public form: UntypedFormGroup;

  public ngOnInit(): void {
    this.form = this.fb.group({
      guid: [''],
      name: [''],
      season: [null]
    });

    if (this.type() === 'edit') {
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
        // With no active season, the form's season is left empty.
        if (season) {
          this.form.patchValue({ season: season.guid });
        }
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

  public deleteEntity() {
    this.saves.save('delete', this.ts.deleteEntity(this.form.getRawValue().guid));
  }

  private _updateEntity() {
    const rawValue = this.form.getRawValue();

    this.saves.save('update', this.ts.updateEntity(rawValue.guid, rawValue));
  }

  private _createEntity() {
    const rawValue = this.form.getRawValue();

    this.saves.save('create', this.ts.createEntity(rawValue));
  }
}
