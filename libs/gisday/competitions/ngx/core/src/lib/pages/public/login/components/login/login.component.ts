import { Component, ChangeDetectionStrategy } from '@angular/core';

import { AuthService } from '@tamu-gisc/gisday/competitions/ngx/common';

@Component({
    selector: 'tamu-gisc-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager
})
export class LoginComponent {
  public loginContext: Window;

  constructor(private auth: AuthService) {}

  public doLogin() {
    this.auth.authenticate('/');
  }
}
