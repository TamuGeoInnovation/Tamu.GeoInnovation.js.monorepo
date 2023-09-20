import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map, shareReplay, switchMap, take } from 'rxjs';

import { Season, SeasonDay } from '@tamu-gisc/gisday/platform/data-api';
import { SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';

import { BaseAdminDetailComponent } from '../../base-admin-detail/base-admin-detail.component';

@Component({
  selector: 'tamu-gisc-seasons-edit',
  templateUrl: './seasons-edit.component.html',
  styleUrls: ['./seasons-edit.component.scss']
})
export class SeasonsEditComponent extends BaseAdminDetailComponent<Season> implements OnInit {
  constructor(private fb: FormBuilder, private at: ActivatedRoute, private ss: SeasonService, private rt: Router) {
    super(fb, at, ss);
  }

  public ngOnInit(): void {
    this.form = this.fb.group({
      guid: [''],
      year: [''],
      active: [''],
      days: this.fb.array([])
    });

    this.entity = this.at.params.pipe(
      map((params) => params.guid),
      filter((guid) => guid !== undefined),
      switchMap((guid) => this.ss.getEntity(guid)),
      shareReplay()
    );

    this.entity.pipe(take(1)).subscribe((res) => {
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

  public override updateEntity() {
    const formValue = this.form.getRawValue();

    this.ss.updateEntity(formValue.guid, formValue).subscribe(() => {
      this.rt.navigate(['admin', 'seasons']);
    });
  }

  /**
   * Calls to delete the season
   */
  public deleteEntity() {
    const formValue = this.form.getRawValue();

    this.ss.deleteEntity(formValue.guid).subscribe(() => {
      this.rt.navigate(['admin', 'seasons']);
    });

    this.form.markAllAsTouched();
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

    const arrayGroup = this.form.get('days') as FormArray;

    arrayGroup.push(this.fb.control(d));

    this.form.markAllAsTouched();
  }

  /**
   * Update the value of an existing day, by index, in the days form array.
   */
  public patchModifiedDay(index: number, day: Partial<SeasonDay>) {
    const control = (this.form.get('days') as FormArray).controls[index] as FormControl;

    control.patchValue(day);

    this.form.markAllAsTouched();
  }

  /**
   * Remove a day, by index, from the days form array.
   */
  public deleteDay(index: number) {
    const arrayGroup = this.form.get('days') as FormArray;

    arrayGroup.removeAt(index);

    this.form.markAllAsTouched();
  }
}

