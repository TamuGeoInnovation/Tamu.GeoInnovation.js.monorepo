import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Observable, filter, map, shareReplay, startWith } from 'rxjs';

import { ActiveSeasonDto, Place, SeasonDay, Speaker, Sponsor } from '@tamu-gisc/gisday/platform/data-api';
import { PlaceService, SeasonService, SpeakerService, SponsorService } from '@tamu-gisc/gisday/platform/ngx/data-access';

const numberDictionary = {
  0: 'Zero',
  1: 'One',
  2: 'Two',
  3: 'Three',
  4: 'Four',
  5: 'Five',
  6: 'Six',
  7: 'Seven',
  8: 'Eight',
  9: 'Nine',
  10: 'Ten'
};

@Component({
  selector: 'tamu-gisc-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  public activeSeason$: Observable<Partial<ActiveSeasonDto>>;
  public activeSeasonDays$: Observable<Array<Partial<SeasonDay>>>;
  public dateRange$: Observable<Array<Date>>;
  public dayCountText$: Observable<string>;

  public organizations$: Observable<Array<Partial<Place>>>;
  public sponsors$: Observable<Array<Partial<Sponsor>>>;
  public organizingMembers$: Observable<Array<Partial<Speaker>>>;

  constructor(
    private titleService: Title,
    private readonly seasonService: SeasonService,
    private readonly placeServices: PlaceService,
    private readonly sponsorService: SponsorService,
    private readonly speakerService: SpeakerService
  ) {
    this.titleService.setTitle('About | TxGIS Day');
  }

  public ngOnInit(): void {
    this.activeSeason$ = this.seasonService.getActiveSeason().pipe(shareReplay());
    this.organizations$ = this.placeServices.getEntities().pipe(shareReplay());
    this.sponsors$ = this.sponsorService.getEntities().pipe(shareReplay());
    this.organizingMembers$ = this.speakerService.getOrganizingEntities().pipe(shareReplay());

    this.activeSeasonDays$ = this.activeSeason$.pipe(
      map((season) => season?.days),
      filter((days) => {
        return days !== undefined;
      }),
      shareReplay()
    );

    this.dateRange$ = this.activeSeasonDays$.pipe(
      map((days) => {
        if (days.length === 0) {
          return null;
        }

        const firstDay = days[0].date;
        const lastDay = days[days.length - 1].date;

        return [firstDay, lastDay];
      })
    );

    this.dayCountText$ = this.activeSeasonDays$.pipe(
      startWith([]),
      map((days) => days.length),
      map((count) => {
        if (count === 0) {
          return 'several event-packed days';
        } else if (count === 1) {
          return 'one event-packed day';
        } else if (count > 1) {
          return `${numberDictionary[count].toLowerCase()} event-packed days`;
        }
      })
    );
  }

  public makeActive(rank: string) {
    this.clearAllOtherPlaques();
    this.setPlaqueVisibleStatus(rank);
  }

  public clearAllOtherPlaques() {
    document.querySelectorAll('.plaque').forEach((elem) => {
      elem.classList.remove('active');
    });

    document.querySelectorAll('.content-block').forEach((elem) => {
      elem.classList.remove('visible');
    });
  }

  public setPlaqueVisibleStatus(rank: string) {
    const plaque = document.querySelector(`[rank=${rank}]`);
    const content = document.querySelector(`.content-block[rank=${rank}]`);

    if (plaque) {
      plaque.classList.add('active');
    }

    if (content) {
      content.classList.add('visible');
    }
  }
}
