import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';
import { SpeakerService } from '@tamu-gisc/gisday/data-access';
import { Speaker } from '@tamu-gisc/gisday/data-api';

@Component({
  selector: 'tamu-gisc-presenters',
  templateUrl: './presenters.component.html',
  styleUrls: ['./presenters.component.scss']
})
export class PresentersComponent implements OnInit {
  public $presenters: Observable<Array<Partial<Speaker>>>;
  constructor(private router: Router, private speakerService: SpeakerService) {
    this.fetchPresenters();
  }

  public ngOnInit(): void {}

  public fetchPresenters() {
    this.$presenters = this.speakerService.getPresenters();
  }

  public onPresenterClicked(presenter: Speaker) {
    this.router.navigate(['presenters/', presenter.guid]);
  }

  public getPresenterImageUrl(presenter: Speaker) {
    return `../assets/images/presenters/${presenter.lastName}${presenter.firstName}.jpg`;
  }
}
