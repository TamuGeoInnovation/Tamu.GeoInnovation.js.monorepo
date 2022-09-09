import { AfterViewInit, Component, ContentChild, OnInit } from '@angular/core';

import { RequestBaseComponent } from '../request-base/request-base.component';

@Component({
  selector: 'tamu-gisc-request-viewer',
  templateUrl: './request-viewer.component.html',
  styleUrls: ['./request-viewer.component.scss']
})
export class RequestViewerComponent implements OnInit, AfterViewInit {
  @ContentChild(RequestBaseComponent)
  public request: RequestBaseComponent;

  public url: string;

  constructor() {
    console.log('Construct');
  }

  public ngOnInit(): void {
    console.log('Init');
  }

  public ngAfterViewInit(): void {
    this.url = this.request.getUrl();
  }
}

