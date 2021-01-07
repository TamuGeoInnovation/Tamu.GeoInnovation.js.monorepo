import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { RecyclingService, RecyclingResultsStatistics } from '../../../core/services/recycling.service';
import { ResultsService } from '../../../data-access/results/results.service';

@Component({
  selector: 'tamu-gisc-total-recycled-card',
  templateUrl: './total-recycled-card.component.html',
  styleUrls: ['./total-recycled-card.component.scss']
})
export class TotalRecycledCardComponent implements OnInit {
  public selectedLocation: Observable<RecyclingResultsStatistics> = this.recyclingService.selectedLocationRecyclingStats;

  constructor(private resultsService: ResultsService, private recyclingService: RecyclingService) {}

  public ngOnInit(): void {}
}
