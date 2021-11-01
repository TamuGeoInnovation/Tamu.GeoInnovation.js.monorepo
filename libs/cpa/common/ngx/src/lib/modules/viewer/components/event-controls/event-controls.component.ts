import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { filter, pluck, shareReplay, startWith, switchMap, take, withLatestFrom } from 'rxjs/operators';

import { IParticipant, Participant } from '@tamu-gisc/cpa/common/entities';
import { ParticipantService } from '@tamu-gisc/cpa/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

@Component({
  selector: 'tamu-gisc-event-controls',
  templateUrl: './event-controls.component.html',
  styleUrls: ['./event-controls.component.scss']
})
export class EventControlsComponent implements OnInit {
  public workshopParticipants: Observable<Array<Participant>>;
  public workshopGuidOrAlias: Observable<string>;

  private _$refresh: Subject<boolean> = new Subject();

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

    this.workshopParticipants = this._$refresh.pipe(
      startWith(true),
      switchMap(() => {
        return this.workshopGuidOrAlias.pipe(take(1));
      }),
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
          // On participant update, refresh the existing participant list to effectively reset changes
          // done to the participant
          this._$refresh.next();

          this.ns.toast({
            id: 'participant-update-error',
            message: 'There was an error updating participant.',
            title: 'Failed to update participant'
          });
        }
      );
    }
  }

  public addParticipant() {
    this.workshopGuidOrAlias
      .pipe(
        take(1),
        switchMap((guidOrAlias) => {
          return this.ps.createParticipantForWorkshop(guidOrAlias, 'New participant');
        })
      )
      .subscribe((createStatus) => {
        this._$refresh.next();
      });
  }
}
