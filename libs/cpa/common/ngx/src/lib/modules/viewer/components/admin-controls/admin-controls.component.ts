import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, pluck, shareReplay, switchMap } from 'rxjs/operators';

import { IParticipant, Participant } from '@tamu-gisc/cpa/common/entities';
import { ParticipantService } from '@tamu-gisc/cpa/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

@Component({
  selector: 'tamu-gisc-admin-controls',
  templateUrl: './admin-controls.component.html',
  styleUrls: ['./admin-controls.component.scss']
})
export class AdminControlsComponent implements OnInit {
  public workshopParticipants: Observable<Array<Participant>>;
  public workshopGuidOrAlias: Observable<string>;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly ps: ParticipantService,
    private readonly ns: NotificationService
  ) {}

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

  public updateParticipantName(participant: IParticipant, updatedParticipantName: string) {
    if (participant.name !== updatedParticipantName) {
      this.ps.updateParticipant(participant.guid, updatedParticipantName).subscribe(
        (res) => {
          // Change was successful. Show notification

          this.ns.toast({
            id: 'participant-update-success',
            message: 'Successfully updated participant.',
            title: 'Updated participant'
          });
        },
        (err) => {
          this.ns.toast({
            id: 'participant-update-error',
            message: 'There was an error updating participant.',
            title: 'Failed to update participant'
          });
        }
      );
    }
  }
}
