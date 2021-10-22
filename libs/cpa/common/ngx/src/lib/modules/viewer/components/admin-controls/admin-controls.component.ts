import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, pluck, shareReplay, switchMap } from 'rxjs/operators';

import { Participant } from '@tamu-gisc/cpa/common/entities';
import { ParticipantService } from '@tamu-gisc/cpa/data-access';

@Component({
  selector: 'tamu-gisc-admin-controls',
  templateUrl: './admin-controls.component.html',
  styleUrls: ['./admin-controls.component.scss']
})
export class AdminControlsComponent implements OnInit {
  public workshopParticipants: Observable<Array<Participant>>;
  public workshopGuidOrAlias: Observable<string>;

  constructor(private readonly route: ActivatedRoute, private readonly ps: ParticipantService) {}

  public ngOnInit(): void {
    this.workshopGuidOrAlias = this.route.queryParams.pipe(
      pluck('workshop'),
      filter((value) => value !== undefined)
    );

    this.workshopParticipants = this.workshopGuidOrAlias.pipe(
      switchMap((guidOrAlias) => {
        return this.ps.getParticipantsForWorkshop(guidOrAlias);
      }),
      shareReplay()
    );
  }
}
