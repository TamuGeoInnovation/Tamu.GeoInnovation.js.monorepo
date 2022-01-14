import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { DeepPartial } from 'typeorm';

import { FieldCategory, EntityValue } from '@tamu-gisc/covid/common/entities';

import { PhoneNumberTypesService } from '../../../data-access/phone-number-types/phone-number-types.service';
import { WebsiteTypesService } from '../../../data-access/website-types/website-types.service';

@Component({
  selector: 'tamu-gisc-county-claim',
  templateUrl: './county-claim.component.html',
  styleUrls: ['./county-claim.component.scss']
})
export class CountyClaimComponent implements OnInit {
  @Input()
  public form: FormGroup;

  @Input()
  public readonly = false;

  public phoneTypes: Observable<Partial<FieldCategory>>;
  public websiteTypes: Observable<Partial<FieldCategory>>;

  constructor(private pt: PhoneNumberTypesService, private wt: WebsiteTypesService, private fb: FormBuilder) {}

  public ngOnInit(): void {
    // List of phone types
    this.phoneTypes = this.pt.getPhoneNumberTypes().pipe(shareReplay(1));

    this.websiteTypes = this.wt.getWebsiteTypes().pipe(shareReplay(1));
  }

  public createPhoneNumberGroup(number?: DeepPartial<EntityValue>): FormGroup {
    return this.fb.group(this.createPhoneNumber(number));
  }

  public createWebsiteGroup(website?: DeepPartial<EntityValue>): FormGroup {
    return this.fb.group(this.createWebsite(website));
  }

  public createPhoneNumber(number?: DeepPartial<EntityValue>): DeepPartial<EntityValue> {
    return {
      value: this.fb.group({
        value: number && number.value && number.value.value,
        type: number && number.value && number.value.type.guid
      })
    };
  }

  public createWebsite(website?: DeepPartial<EntityValue>): DeepPartial<EntityValue> {
    return {
      value: this.fb.group({
        value: website && website.value && website.value.value,
        type: website && website.value && website.value.type.guid
      })
    };
  }

  /**
   * Push a phone number form group to the form array
   */
  public addPhoneNumber() {
    (this.form.get('phoneNumbers') as FormArray).push(this.createPhoneNumberGroup());
  }

  public addWebsite() {
    (this.form.get(['websites']) as FormArray).push(this.createWebsiteGroup());
  }

  public removeFormArrayControl(collection: string, index: number) {
    (this.form.get([collection]) as FormArray).removeAt(index);
  }
}
