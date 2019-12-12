import { Component } from '@angular/core';

import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'tamu-gisc-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  public loginContext: Window;

  constructor(private auth: AuthService) {}

  public doLogin() {
    this.auth.authenticate('/');
  }
}
