import { Component, OnInit } from '@angular/core';

import { AccountDetailsService } from '@tamu-gisc/geoservices/modules/data-access';

@Component({
  selector: 'tamu-gisc-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  constructor(private service: AccountDetailsService) {}

  public ngOnInit() {
    // this.service.login().subscribe((res) => {
    //   this.service.details.subscribe((res) => {
    //     debugger;
    //   });
    // });
  }
}
