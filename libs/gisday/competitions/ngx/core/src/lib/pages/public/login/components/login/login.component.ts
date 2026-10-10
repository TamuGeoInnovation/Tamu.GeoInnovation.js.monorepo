import { Component, ChangeDetectionStrategy, inject } from '@angular/core';

import { AuthService } from '@tamu-gisc/gisday/competitions/ngx/common';

@Component({
  selector: 'tamu-gisc-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager
})
export class LoginComponent {
  private auth = inject(AuthService);

  public loginContext: Window;

  public doLogin() {
    this.auth.authenticate('/');
  }
}
