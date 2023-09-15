import { Buffer } from 'buffer';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { map, Observable, switchMap, tap } from 'rxjs';

import { SpeakerService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Speaker } from '@tamu-gisc/gisday/platform/data-api';

@Component({
  selector: 'tamu-gisc-people-details',
  templateUrl: './people-details.component.html',
  styleUrls: ['./people-details.component.scss']
})
export class PeopleDetailsComponent implements OnInit {
  public speakerGuid: string;
  public $speaker: Observable<Partial<Speaker>>;

  constructor(private route: ActivatedRoute, private speakerService: SpeakerService) {}

  public ngOnInit(): void {
    this.$speaker = this.route.params.pipe(
      map((params) => params['guid']),
      switchMap((speakerGuid) => this.speakerService.getPresenter(speakerGuid)),
      tap((speaker) => console.log(speaker))
    );
  }

  public unwrapPhoto(byteArray) {
    const buffer = Buffer.from(byteArray as Uint8Array).toString('base64');
    return `data:image/png;base64,${buffer}`;
  }
}
