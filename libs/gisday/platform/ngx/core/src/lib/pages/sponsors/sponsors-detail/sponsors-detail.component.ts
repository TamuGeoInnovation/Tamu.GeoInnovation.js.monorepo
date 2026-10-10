import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { map, Observable, switchMap } from 'rxjs';

import { Sponsor } from '@tamu-gisc/gisday/platform/data-api';
import { SponsorService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { AsyncPipe } from '@angular/common';
import { MarkdownParsePipe } from '@tamu-gisc/common/ngx/pipes';

@Component({
  selector: 'tamu-gisc-sponsors-detail',
  templateUrl: './sponsors-detail.component.html',
  styleUrls: ['./sponsors-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [AsyncPipe, MarkdownParsePipe]
})
export class SponsorsDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private readonly sponsorService = inject(SponsorService);

  public $sponsor: Observable<Partial<Sponsor>>;

  public ngOnInit() {
    this.$sponsor = this.route.params.pipe(
      map((params) => params['guid']),
      switchMap((sponsorGuid) => this.sponsorService.getEntity(sponsorGuid))
    );
  }
}
