import { Component, OnInit } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Component({
  selector: 'tamu-gisc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public loginUrl: string;

  constructor(private env: EnvironmentService) {}

  public ngOnInit() {
    this.loginUrl = this.env.value('api_url') + '/oidc/login';
  }
}
