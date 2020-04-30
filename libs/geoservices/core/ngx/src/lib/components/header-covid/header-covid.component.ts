import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { pluck } from 'rxjs/operators';

import { HeaderComponent } from '../header/header.component';
import { IdentityService } from '../../services/identity.service';

@Component({
  selector: 'tamu-gisc-header-covid',
  templateUrl: './header-covid.component.html',
  styleUrls: ['../header/header.component.scss']
})
export class HeaderCovidComponent extends HeaderComponent {
  public hasEmail: Observable<string>;

  constructor(private is: IdentityService) {
    super();

    this.hasEmail = this.is.identity.pipe(pluck('user', 'email'));
  }
}
