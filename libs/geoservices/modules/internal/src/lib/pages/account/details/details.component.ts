import { Component, OnInit } from '@angular/core';

import { AccountDetailsService, AuthService } from '@tamu-gisc/geoservices/modules/data-access';

@Component({
  selector: 'tamu-gisc-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  constructor(private auth: AuthService, private service: AccountDetailsService) {}

  public ngOnInit() {
    this.service.details.subscribe((res) => {
      debugger;
    });
  }
}
