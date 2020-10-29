import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { IWorkshopRequestPayload } from '@tamu-gisc/cpa/data-api';

import { WorkshopService } from '../../../../services/workshop.service';

@Component({
  selector: 'tamu-gisc-workshop-list',
  templateUrl: './workshop-list.component.html',
  styleUrls: ['./workshop-list.component.scss'],
  providers: [WorkshopService]
})
export class WorkshopListComponent implements OnInit {
  public workshops: Observable<IWorkshopRequestPayload[]>;
  constructor(private service: WorkshopService) {}

  public ngOnInit() {
    this.fetchRecords();
  }

  public delete(guid: string) {
    this.service.deleteWorkshop(guid).subscribe((deleteStatus) => {
      console.log(`Deleted ${guid}`);
      this.fetchRecords();
    });
  }

  public fetchRecords() {
    this.workshops = this.service.getWorkshops().pipe(shareReplay(1));
  }
}
