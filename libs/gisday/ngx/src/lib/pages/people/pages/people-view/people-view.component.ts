import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SpeakerService, IPhotoReponse } from '@tamu-gisc/gisday/data-access';
import { Speaker } from '@tamu-gisc/gisday/data-api';

@Component({
  selector: 'tamu-gisc-people-view',
  templateUrl: './people-view.component.html',
  styleUrls: ['./people-view.component.scss']
})
export class PeopleViewComponent implements OnInit {
  public $people: Observable<Array<Partial<Speaker>>>;
  public $photo: Observable<IPhotoReponse>;
  public photo: string;
  constructor(private router: Router, private speakerService: SpeakerService) {
    this.fetchPresenters();
  }

  public ngOnInit(): void {}

  public fetchPresenters() {
    this.$people = this.speakerService.getPresenters().pipe(
      map((speakers) => {
        speakers.forEach((speaker) => {
          this.speakerService.getPhoto(speaker.speakerInfo.guid).subscribe((rep) => {
            speaker.speakerInfo.base64representation = rep;
          });
          // speaker.speakerInfo.base64representation = this.speakerService.getPhoto(speaker.speakerInfo.guid);
        });
        return speakers;
      })
    );
  }

  public onPresenterClicked(person: Speaker) {
    this.router.navigate(['presenters/', person.guid]);
  }

  public unwrapPhoto(base64: string) {
    return `\"data:image/jpg;base64,${base64}\"`;
  }

  public getPresenterImageUrl(person: Speaker) {
    // this.speakerService.getPhoto(person.speakerInfo.guid).subscribe((response) => {
    //   this.photo = `url("data:image/png;base64,${response.base64}")`;
    // });
    return `../assets/images/presenters/${person.lastName}${person.firstName}.jpg`;
  }
}
