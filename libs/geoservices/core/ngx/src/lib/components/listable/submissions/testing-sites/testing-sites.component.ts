import { Component, OnDestroy, OnInit } from '@angular/core';
import { County, FieldCategory } from '@tamu-gisc/covid/common/entities';
import { CountyClaimsService, PhoneNumbersService, PhoneNumberTypesService, TestingSitesService, WebsitesService, WebsiteTypesService, FormattedTestingSite } from '@tamu-gisc/geoservices/data-access';
import { Observable } from 'rxjs';

@Component({
  selector: 'tamu-gisc-testing-sites-list',
  templateUrl: './testing-sites.component.html',
  styleUrls: ['./testing-sites.component.scss']
})
export class TestingSiteListComponent implements  OnInit, OnDestroy {
  public counties: Observable<Array<Partial<County>>>;
  public testingSites: Observable<Array<Partial<FormattedTestingSite>>>;
  public phoneTypes: Observable<Partial<FieldCategory>>;
  public websiteTypes: Observable<Partial<FieldCategory>>;

  constructor(
    private pt: PhoneNumberTypesService,
    private pn: PhoneNumbersService,
    private wt: WebsiteTypesService,
    private ws: WebsitesService,
    private cl: CountyClaimsService,
    private ts: TestingSitesService,
  ) { }

  ngOnInit() {
    this.testingSites = this.ts.getTestingSitesSortedByCounty();
  }

  ngOnDestroy() {
    // this._$destroy.next();
    // this._$destroy.complete();
  }

}
