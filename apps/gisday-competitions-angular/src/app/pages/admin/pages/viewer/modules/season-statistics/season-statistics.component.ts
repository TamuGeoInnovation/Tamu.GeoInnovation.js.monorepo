import { Component, OnInit } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { DeepPartial } from 'typeorm';

import { CompetitionForm, CompetitionSeason, SeasonStatisticsDto } from '@tamu-gisc/gisday/competitions';

import { ViewerService } from '../../services/viewer.service';
import { SeasonsService } from '../../../../../../modules/data-access/seasons/seasons.service';

@Component({
  selector: 'tamu-gisc-season-statistics',
  templateUrl: './season-statistics.component.html',
  styleUrls: ['./season-statistics.component.scss']
})
export class SeasonStatisticsComponent implements OnInit {
  public season: Observable<DeepPartial<CompetitionSeason>>;
  public stats: Observable<SeasonStatisticsDto>;
  public seasonForm: Observable<CompetitionForm>;

  public mergedStats: Observable<Array<{ title: string; breakdown: CalculatedBreakdown }>>;

  constructor(private readonly vs: ViewerService, private readonly ss: SeasonsService) {}

  public ngOnInit(): void {
    this.season = this.vs.season;
    this.seasonForm = this.vs.seasonForm;
    this.stats = this.season.pipe(
      switchMap((season) => {
        return this.ss.getSeasonStatistics(season.guid);
      }),
      shareReplay()
    );

    this.mergedStats = combineLatest([this.stats, this.seasonForm]).pipe(
      map(([stats, form]) => {
        return Object.entries(stats.breakdown).reduce((acc, [key, value]) => {
          // Get the question object from season form model that matches the stat key.
          // The stat key should match one of the season form question attributes.
          const question = form.model.find((q) => q.attribute === key);

          return [
            ...acc,
            {
              title: question.title,
              breakdown: Object.entries(value).map(([answer, count]) => {
                return {
                  answer: answer,
                  count: count,
                  percentage: (count / stats.total) * 100
                };
              })
            }
          ];
        }, []);
      }),
      shareReplay()
    );
  }
}

export type CalculatedBreakdown = [{ answer: string; count: number; percentage: number }];
