import { Component, OnInit } from '@angular/core';
import { interval, Observable } from 'rxjs';
import { shareReplay, startWith, switchMap, withLatestFrom } from 'rxjs/operators';

import { IParticipant } from '@tamu-gisc/cpa/common/entities';
import { ParticipantService } from '@tamu-gisc/cpa/ngx/data-access';

import { ViewerService } from '../../services/viewer.service';

@Component({
  selector: 'tamu-gisc-participant-group-list',
  templateUrl: './participant-group-list.component.html',
  styleUrls: ['./participant-group-list.component.scss']
})
export class ParticipantGroupListComponent implements OnInit {
  public participants: Observable<Array<IParticipant>>;

  constructor(private readonly ps: ParticipantService, private readonly vs: ViewerService) {}

  public ngOnInit(): void {
    this.participants = interval(3000).pipe(
      startWith(0),
      withLatestFrom(this.vs.workshopGuid),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      switchMap(([i, wsGuid]) => {
        return this.ps.getParticipantsForWorkshop(wsGuid);
      }),
      shareReplay()
    );
  }
}
