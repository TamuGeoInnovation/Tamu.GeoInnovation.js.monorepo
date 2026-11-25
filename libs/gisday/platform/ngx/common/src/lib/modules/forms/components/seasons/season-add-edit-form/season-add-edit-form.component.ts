import { Component, OnInit, inject, input, signal } from '@angular/core';
import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, filter, map, shareReplay, switchMap, take } from 'rxjs';

import { Season, SeasonDay } from '@tamu-gisc/gisday/platform/data-api';
import { SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { CheckboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { SeasonsDayTileComponent } from '../seasons-day-tile/seasons-day-tile.component';
import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';

import { adminEntityForm } from '../../../admin-entity-form';

@Component({
  selector: 'tamu-gisc-season-add-edit-form',
  templateUrl: './season-add-edit-form.component.html',
  styleUrls: ['./season-add-edit-form.component.scss'],
  imports: [FormsModule, ReactiveFormsModule, TextboxComponent, CheckboxComponent, SeasonsDayTileComponent, ButtonComponent]
})
export class SeasonAddEditFormComponent implements OnInit {
  private fb = inject(UntypedFormBuilder);
  private at = inject(ActivatedRoute);
  private ss = inject(SeasonService);
  /** Its save and delete, and what they say (#3340, #3382). */
  private readonly saves = adminEntityForm('Season', '/admin/seasons');

  public readonly type = input<'create' | 'edit'>(undefined);

  public entity$: Observable<Partial<Season>>;
  public form: UntypedFormGroup;

  /**
   * The day controls, as a new list whenever a day is added or removed.
   */
  public readonly days = signal<Array<AbstractControl>>([]);

  public ngOnInit(): void {
    this.form = this.fb.group({
      guid: [''],
      year: [''],
      active: [''],
      days: this.fb.array([])
    });

    this.entity$ = this.at.params.pipe(
      map((params) => params.guid),
      filter((guid) => guid !== undefined),
      switchMap((guid) => this.ss.getEntity(guid)),
      shareReplay()
    );

    this.entity$.pipe(take(1)).subscribe((res) => {
      this.form.patchValue({
        guid: res.guid,
        year: res.year,
        active: res.active
      });

      res.days.forEach((day) => {
        this.addDay(day);
      });

      this.form.markAsPristine();
      this.form.markAsUntouched();
    });
  }

  /**
   * Create and add a new form control to the days form array.
   */
  public addDay(day?: Partial<SeasonDay>) {
    // Create a new day and push it to the days subject.
    const d = {
      guid: day?.guid || undefined,
      date: day ? new Date(day.date) : new Date()
    };

    const arrayGroup = this.form.get('days') as UntypedFormArray;

    arrayGroup.push(this.fb.control(d));
    this.days.set([...arrayGroup.controls]);

    this.form.markAllAsTouched();
    // A change not yet saved (#2942); the days the season is opened with are set back to unchanged once added.
    this.form.markAsDirty();
  }

  /**
   * Remove a day, by index, from the days form array.
   */
  public deleteDay(index: number) {
    const arrayGroup = this.form.get('days') as UntypedFormArray;

    arrayGroup.removeAt(index);
    this.days.set([...arrayGroup.controls]);

    this.form.markAllAsTouched();
    this.form.markAsDirty();
  }

  /**
   * Update the value of an existing day, by index, in the days form array.
   */
  public patchModifiedDay(index: number, day: Partial<SeasonDay>) {
    const control = (this.form.get('days') as UntypedFormArray).controls[index] as UntypedFormControl;

    control.patchValue(day);

    this.form.markAllAsTouched();
    this.form.markAsDirty();
  }

  public updateEntity() {
    const formValue = this.form.getRawValue();

    this.saves.save('update', this.ss.updateEntity(formValue.guid, formValue));
  }

  /**
   * Calls to delete the season
   */
  public deleteEntity() {
    const formValue = this.form.getRawValue();

    this.saves.save('delete', this.ss.deleteEntity(formValue.guid));

    this.form.markAllAsTouched();
  }
}
