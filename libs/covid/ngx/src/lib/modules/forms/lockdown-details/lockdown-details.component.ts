import { Component, OnInit, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Observable } from 'rxjs';

import { FieldCategory, EntityValue } from '@tamu-gisc/covid/common/entities';

import { WebsiteTypesService } from '../../../data-access/website-types/website-types.service';
import { PhoneNumberTypesService } from '../../../data-access//phone-number-types/phone-number-types.service';
import { ActiveLockdown } from '../../../data-access/lockdowns/lockdowns.service';

@Component({
  selector: 'tamu-gisc-lockdown-details',
  templateUrl: './lockdown-details.component.html',
  styleUrls: ['./lockdown-details.component.scss']
})
export class LockdownDetailsComponent implements OnInit, OnChanges {
  @Output()
  public lockdownSubmit: EventEmitter<unknown> = new EventEmitter();

  @Input()
  public lockdown: ActiveLockdown;

  @Input()
  public email: string;

  @Input()
  public county: string | number;

  public form: FormGroup;

  public websitesTypes: Observable<Partial<FieldCategory>>;
  public phoneTypes: Observable<Partial<FieldCategory>>;

  public lockdownState: Observable<boolean>;

  public lockdownOptions = [
    {
      value: true,
      label: 'Yes'
    },
    {
      value: false,
      label: 'No'
    }
  ];

  constructor(private fb: FormBuilder, private wt: WebsiteTypesService, private pt: PhoneNumberTypesService) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      claim: this.fb.group({
        user: ['', Validators.required],
        county: ['']
      }),
      info: this.fb.group({
        isLockdown: [],
        hasUnknownEndDate: [false],
        startDate: [new Date().toISOString().split('T')[0]],
        endDate: [new Date().toISOString().split('T')[0]],
        protocol: [''],
        notes: [''],
        phoneNumbers: this.fb.array([]),
        websites: this.fb.array([])
      })
    });

    this.websitesTypes = this.wt.getWebsiteTypes();
    this.phoneTypes = this.pt.getPhoneNumberTypes();

    this.lockdownState = (this.form.controls.info as FormGroup).controls.isLockdown.valueChanges;

    this.form.get(['info', 'hasUnknownEndDate']).valueChanges.subscribe((hasUnknownDate) => {
      const control = this.form.get(['info', 'endDate']);

      if (hasUnknownDate) {
        control.disable();
        control.patchValue(undefined);
      } else {
        control.enable();
        control.patchValue(new Date().toISOString().split('T')[0]);
      }
    });
  }

  public ngOnChanges(changes: SimpleChanges) {
    const lockdown: Partial<ActiveLockdown> =
      changes.lockdown && changes.lockdown.currentValue ? changes.lockdown.currentValue : undefined;
    const email: string = changes.email && changes.email.currentValue ? changes.email.currentValue : undefined;
    const county: string | number = changes.county ? changes.county.currentValue : undefined;

    if (this.form) {
      if (lockdown && Object.keys(lockdown).length > 0) {
        const merged = {
          claim: {
            user: email,
            county: lockdown && lockdown.claim ? lockdown.claim.county.countyFips : county
          },
          info: {
            isLockdown: lockdown.info.isLockdown,
            hasUnknownEndDate: lockdown.info.endDate === null ? true : false,
            startDate: lockdown.info.startDate ? lockdown.info.startDate.split('T')[0] : undefined,
            endDate: lockdown.info.endDate ? lockdown.info.endDate.split('T')[0] : undefined,
            protocol: lockdown.info.protocol,
            notes: lockdown.info.notes
          }
        };

        this.form.patchValue(merged);
      } else {
        const merged = {
          claim: {
            user: email,
            county: county
          }
        };

        this.form.patchValue(merged);
      }

      if (lockdown && lockdown.info && lockdown.info.phoneNumbers) {
        const phc = this.form.get(['info', 'phoneNumbers']) as FormArray;
        lockdown.info.phoneNumbers.forEach((n) => phc.push(this.createPhoneNumberGroup(n)));
      }

      if (lockdown && lockdown.info && lockdown.info.websites) {
        const wc = this.form.get(['info', 'websites']) as FormArray;
        lockdown.info.websites.forEach((w) => wc.push(this.createWebsiteGroup(w)));
      }
    }
  }

  public createPhoneNumberGroup(number?: Partial<EntityValue>): FormGroup {
    return this.fb.group(this.createPhoneNumber(number));
  }

  public createWebsiteGroup(website?: Partial<EntityValue>): FormGroup {
    return this.fb.group(this.createWebsite(website));
  }

  public createPhoneNumber(number?: Partial<EntityValue>) {
    return {
      value: this.fb.group({
        value: number && number.value && number.value.value,
        type: number && number.value && number.value.type.guid
      })
    };
  }

  public createWebsite(website?: Partial<EntityValue>) {
    return {
      value: this.fb.group({
        value: website && website.value && website.value.value,
        type: website && website.value && website.value.type.guid
      })
    };
  }

  public addPhoneNumber() {
    (this.form.get(['info', 'phoneNumbers']) as FormArray).push(this.createPhoneNumberGroup());
  }

  public addWebsite() {
    (this.form.get(['info', 'websites']) as FormArray).push(this.createWebsiteGroup());
  }

  public removeFormArrayControl(collection: string, index: number) {
    (this.form.get(['info', collection]) as FormArray).removeAt(index);
  }

  public submitLockdown() {
    const lockdown = this.form.getRawValue();

    lockdown.info.isLockdown = lockdown.info.isLockdown;
    lockdown.info.protocol = lockdown.info.isLockdown === true ? lockdown.info.protocol : undefined;
    lockdown.info.startDate = lockdown.info.isLockdown === true ? lockdown.info.startDate : undefined;
    lockdown.info.endDate =
      lockdown.info.isLockdown === true && !lockdown.info.hasUnknownEndDate ? lockdown.info.endDate : null;

    this.lockdownSubmit.emit(lockdown);
  }
}
