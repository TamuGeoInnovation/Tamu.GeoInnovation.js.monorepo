import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { IWorkshopRequestPayload } from '@tamu-gisc/cpa/data-api';
import { WorkshopService } from '@tamu-gisc/cpa/ngx/data-access';

@Component({
  selector: 'tamu-gisc-participant-workshops-list',
  templateUrl: './participant-workshops-list.component.html',
  styleUrls: ['./participant-workshops-list.component.scss']
})
export class ParticipantWorkshopsListComponent implements OnInit {
  public workshops: Observable<Array<IWorkshopRequestPayload>>;

  constructor(private readonly ws: WorkshopService) {}

  public ngOnInit(): void {
    this.workshops = this.ws.getWorkshops();
  }
}
