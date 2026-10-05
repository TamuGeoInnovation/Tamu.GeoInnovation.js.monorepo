import { Component } from '@angular/core';

import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'tamu-gisc-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.scss'],
  standalone: false
})
export class CallbackComponent {
  constructor(private readonly as: AuthService) {}
}
