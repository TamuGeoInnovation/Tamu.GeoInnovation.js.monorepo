import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { map, Observable, switchMap } from 'rxjs';

import { Sponsor } from '@tamu-gisc/gisday/platform/data-api';
import { SponsorService } from '@tamu-gisc/gisday/platform/ngx/data-access';

@Component({
  selector: 'tamu-gisc-sponsors-detail',
  templateUrl: './sponsors-detail.component.html',
  styleUrls: ['./sponsors-detail.component.scss']
})
export class SponsorsDetailComponent implements OnInit {
  public $sponsor: Observable<Partial<Sponsor>>;

  constructor(private route: ActivatedRoute, private readonly sponsorService: SponsorService) {}

  public ngOnInit() {
    this.$sponsor = this.route.params.pipe(
      map((params) => params['guid']),
      switchMap((sponsorGuid) => this.sponsorService.getEntity(sponsorGuid))
    );
  }
}
