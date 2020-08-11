import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { DeepPartial } from 'typeorm';

import { EntityValue } from '@tamu-gisc/covid/common/entities';
import { WebsitesService, PhoneNumbersService } from '@tamu-gisc/geoservices/data-access';

@Component({
  selector: 'tamu-gisc-county-claim-info-details',
  templateUrl: './county-claim-info-details.component.html',
  styleUrls: ['./county-claim-info-details.component.scss']
})
export class CountyClaimInfoDetailsComponent implements OnInit {
  @Input()
  public infoGuid: string;

  public form: FormGroup;

  constructor(private fb: FormBuilder, private ws: WebsitesService, private pn: PhoneNumbersService) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      phoneNumbers: this.fb.array([this.createPhoneNumberGroup()]),
      websites: this.fb.array([this.createPhoneNumberGroup()])
    });

    this.ws.getWebsitesForClaimInfo(this.infoGuid).subscribe((websites) => {
      const websiteGroup = this.form.get('websites') as FormArray;

      if (websites && websites.length > 0) {
        // // Clear any empty website fields
        websiteGroup.clear();

        // Format the response websites to a suitable form group structure
        websites.map((n) => websiteGroup.push(this.createWebsiteGroup(n)));
      } else {
        websiteGroup.clear();
      }
    });

    this.pn.getPhoneNumbersForClaimInfo(this.infoGuid).subscribe((numbers) => {
      const phoneGroup = this.form.get('phoneNumbers') as FormArray;

      if (numbers && numbers.length > 0) {
        // // Clear any empty phone number fields
        phoneGroup.clear();

        // Format the response phone numbers to a suitable form group structure
        numbers.map((n) => phoneGroup.push(this.createPhoneNumberGroup(n)));
      } else {
        phoneGroup.clear();
      }
    });
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
}
