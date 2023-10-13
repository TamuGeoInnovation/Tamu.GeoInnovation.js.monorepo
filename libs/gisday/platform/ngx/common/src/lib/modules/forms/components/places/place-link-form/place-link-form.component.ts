import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, debounceTime, takeUntil, tap } from 'rxjs';

import { PlaceLink } from '@tamu-gisc/gisday/platform/data-api';

@Component({
  selector: 'tamu-gisc-place-link-form',
  templateUrl: './place-link-form.component.html',
  styleUrls: ['./place-link-form.component.scss']
})
export class PlaceLinkFormComponent implements OnInit, OnDestroy {
  @Input()
  public link: Partial<PlaceLink>;

  @Input()
  public index: number;

  @Output()
  public updated: EventEmitter<Partial<PlaceLink>> = new EventEmitter();

  public form: FormGroup;

  private _destroy$: Subject<boolean> = new Subject();

  constructor(private readonly fb: FormBuilder) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      guid: [this.link?.guid || null],
      label: [this.link?.label || null],
      url: [this.link?.url || null]
    });

    this.form.valueChanges
      .pipe(
        debounceTime(100),
        tap((value) => {
          console.log('emitting', value);
        }),
        takeUntil(this._destroy$)
      )
      .subscribe(this.updated);
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }
}

