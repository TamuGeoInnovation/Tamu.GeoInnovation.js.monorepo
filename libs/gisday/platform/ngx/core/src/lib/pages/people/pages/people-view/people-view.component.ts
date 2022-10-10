import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';

import { SpeakerService, IPhotoReponse } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Speaker } from '@tamu-gisc/gisday/platform/data-api';

@Component({
  selector: 'tamu-gisc-people-view',
  templateUrl: './people-view.component.html',
  styleUrls: ['./people-view.component.scss']
})
export class PeopleViewComponent implements OnInit {
  public $people: Observable<Array<Partial<Speaker>>>;
  public $photo: Observable<IPhotoReponse>;
  public photo: string;

  constructor(private router: Router, private speakerService: SpeakerService) {}

  public ngOnInit() {
    this.$people = this.speakerService.getPresenters();
  }

  public unwrapPhoto(base64: string) {
    const ret = `"data:image/jpg;base64,${base64}"`;
    return ret;
  }
}
