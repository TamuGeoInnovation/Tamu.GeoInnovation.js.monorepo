import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import { SpeakerService } from '@tamu-gisc/gisday/data-access';
import { Speaker } from '@tamu-gisc/gisday/data-api';

@Component({
  selector: 'tamu-gisc-presenter-details',
  templateUrl: './presenter-details.component.html',
  styleUrls: ['./presenter-details.component.scss']
})
export class PresenterDetailsComponent implements OnInit {
  public speakerGuid: string;
  public $speaker: Observable<Partial<Speaker>>;
  constructor(private route: ActivatedRoute, private speakerService: SpeakerService) {}

  ngOnInit(): void {
    if (this.route.snapshot.params.guid) {
      this.speakerGuid = this.route.snapshot.params.guid;
      this.$speaker = this.speakerService.getPresenter(this.speakerGuid);
    }
  }
  public getPresenterImageUrl(presenter: Speaker) {
    return `../assets/images/presenters/${presenter.lastName}${presenter.firstName}.jpg`;
  }
}
