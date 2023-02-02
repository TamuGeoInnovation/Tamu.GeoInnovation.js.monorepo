import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthService, LoggedInState } from '@tamu-gisc/geoservices/data-access';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Component({
  selector: 'tamu-gisc-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  public loggedIn: Observable<LoggedInState>;
  public url: string;

  constructor(private readonly as: AuthService, private readonly env: EnvironmentService) {}

  public ngOnInit() {
    this.loggedIn = this.as.state();
    this.url = this.env.value('accounts_url');
  }
}
