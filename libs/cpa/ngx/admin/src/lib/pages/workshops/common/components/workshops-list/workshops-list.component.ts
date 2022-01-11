import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { IWorkshopRequestPayload } from '@tamu-gisc/cpa/data-api';

import { WorkshopService } from '@tamu-gisc/cpa/data-access';

@Component({
  selector: 'tamu-gisc-workshops-list',
  templateUrl: './workshops-list.component.html',
  styleUrls: ['./workshops-list.component.scss']
})
export class WorkshopsListComponent implements OnInit {
  public workshops: Observable<IWorkshopRequestPayload[]>;

  constructor(private service: WorkshopService) {}

  public ngOnInit() {
    this.workshops = this.service.getWorkshops().pipe(shareReplay(1));
  }
}
