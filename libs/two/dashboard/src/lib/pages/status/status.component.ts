import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';

import { StatusService, IStatusResponse } from '@tamu-gisc/two/data-access';

@Component({
  selector: 'two-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss']
})
export class StatusComponent implements OnInit {
  public status: Observable<Array<Partial<IStatusResponse>>>;

  constructor(private statusService: StatusService) {}

  public ngOnInit() {
    this.status = this.statusService.status();
  }
}
