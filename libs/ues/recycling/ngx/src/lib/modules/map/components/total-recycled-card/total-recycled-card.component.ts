import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, pluck, switchMap } from 'rxjs/operators';

import { RecyclingService, RecyclingResultsStatistics } from '../../../core/services/recycling.service';
import { ResultsService } from '../../../data-access/results/results.service';

@Component({
  selector: 'tamu-gisc-total-recycled-card',
  templateUrl: './total-recycled-card.component.html',
  styleUrls: ['./total-recycled-card.component.scss']
})
export class TotalRecycledCardComponent implements OnInit {
  public selectedLocation: Observable<RecyclingResultsStatistics> = this.recyclingService.allOrSelectedRecyclingStats;

  public totalWeight: Observable<number>;
  public unit: BehaviorSubject<'lbs' | 'tons'> = new BehaviorSubject('lbs');

  constructor(private resultsService: ResultsService, private recyclingService: RecyclingService) {}

  public ngOnInit(): void {
    this.totalWeight = this.unit.pipe(
      switchMap((unit) => {
        let factor = 1;

        if (unit === 'tons') {
          factor = 1 / 2000;
        }

        return this.selectedLocation.pipe(
          pluck('total'),
          map((total) => {
            return total * factor;
          })
        );
      })
    );
  }

  public toggleUnit() {
    if (this.unit.getValue() === 'lbs') {
      this.unit.next('tons');
    } else {
      this.unit.next('lbs');
    }
  }
}
