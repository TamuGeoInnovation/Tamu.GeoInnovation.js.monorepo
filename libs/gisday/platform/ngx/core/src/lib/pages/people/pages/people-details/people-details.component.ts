import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs';

import { SpeakerService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Speaker } from '@tamu-gisc/gisday/data-api';

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
    if (this.route.snapshot.params.guid) {
      this.speakerGuid = this.route.snapshot.params.guid;
      this.$speaker = this.speakerService.getPresenter(this.speakerGuid);
    }
  }

  public unwrapPhoto(base64: string) {
    const ret = `\"data:image/jpg;base64,${base64}\"`;
    return ret;
  }
}
