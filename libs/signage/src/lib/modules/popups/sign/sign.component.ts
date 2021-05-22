import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay, pluck } from 'rxjs/operators';

import { BasePopupComponent } from '@tamu-gisc/maps/feature/popup';

@Component({
  selector: 'tamu-gisc-sign',
  templateUrl: './sign.component.html',
  styleUrls: ['./sign.component.scss']
})
export class SignPopupComponent extends BasePopupComponent implements OnInit {
  public details: Observable<ISignagePhoto>;

  constructor(private http: HttpClient) {
    super();
  }

  public ngOnInit() {
    this.details = this.http
      .get('https://gisday.tamu.edu/Rest/Signage/Get/Photos/', {
        params: {
          submissionGuid: this.data.attributes.guid
        }
      })
      .pipe(
        pluck<ISignagePhotoResponse, ISignagePhoto>('items', '0'),
        shareReplay(1)
      );
  }
}

interface ISignagePhoto {
  added: string;
  guid: string;
  imageBase64String: string;
  submissionGuid: string;
}

interface ISignagePhotoResponse {
  items: Array<ISignagePhoto>;
}
