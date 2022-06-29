import { Component } from '@angular/core';

import { EmailService } from '@tamu-gisc/mailroom/data-access';

@Component({
  selector: 'tamu-gisc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'mailroom-angular';

  constructor(private readonly service: EmailService) {}
}
