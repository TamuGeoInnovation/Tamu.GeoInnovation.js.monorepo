import { Component, ChangeDetectionStrategy, inject } from '@angular/core';

import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'tamu-gisc-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager
})
export class CallbackComponent {
  private readonly as = inject(AuthService);
}
