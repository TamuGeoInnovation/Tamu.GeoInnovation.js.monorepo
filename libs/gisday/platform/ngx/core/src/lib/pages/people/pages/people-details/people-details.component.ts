import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { map, Observable, switchMap } from 'rxjs';

import { SpeakerService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Speaker } from '@tamu-gisc/gisday/platform/data-api';
import { SpeakerAvatarComponent } from '@tamu-gisc/gisday/platform/ngx/common';
import { AsyncPipe, DatePipe } from '@angular/common';
import { ParseDateTimeStringsPipe } from '@tamu-gisc/gisday/platform/ngx/common';
import { MarkdownParsePipe } from '@tamu-gisc/common/ngx/pipes';

@Component({
  selector: 'tamu-gisc-people-details',
  templateUrl: './people-details.component.html',
  styleUrls: ['./people-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [SpeakerAvatarComponent, RouterLink, AsyncPipe, DatePipe, ParseDateTimeStringsPipe, MarkdownParsePipe]
})
export class PeopleDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private speakerService = inject(SpeakerService);

  public speakerGuid: string;
  public $speaker: Observable<Partial<Speaker>>;

  public ngOnInit(): void {
    this.$speaker = this.route.params.pipe(
      map((params) => params['guid']),
      switchMap((speakerGuid) => this.speakerService.getPresenter(speakerGuid))
    );
  }
}
