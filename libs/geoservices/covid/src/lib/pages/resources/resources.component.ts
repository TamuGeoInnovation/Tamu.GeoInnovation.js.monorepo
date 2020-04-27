import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { pluck, filter} from 'rxjs/operators';

import { IdentityService } from '@tamu-gisc/geoservices/core/ngx';
import { User } from '@tamu-gisc/covid/common/entities';

@Component({
  selector: 'tamu-gisc-resources',
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.scss']
})
export class ResourcesComponent implements OnInit {
  public localEmail: Observable<Partial<User['email']>>;
  public email: boolean;

  constructor(private is: IdentityService) {}

  public ngOnInit() {
    this.is.identity.pipe(
      pluck('user', 'email'),
      filter((email) => {
        return email !== undefined;
      })).subscribe((email) => {
        if (email) {
          this.email = true;
        } else {
          this.email = false;
        }
      });
  }
}
