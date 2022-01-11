import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';

import { LockdownsService, ActiveLockdown } from '@tamu-gisc/geoservices/data-access';

@Component({
  selector: 'tamu-gisc-lockdown-info-details',
  templateUrl: './lockdown-info-details.component.html',
  styleUrls: ['./lockdown-info-details.component.scss']
})
export class LockdownInfoDetailsComponent implements OnInit {
  @Input()
  public infoGuid: string;

  public info: Observable<ActiveLockdown>;

  constructor(private ls: LockdownsService) {}

  public ngOnInit(): void {
    this.info = this.ls.getLockdownInfoDetails(this.infoGuid);
  }
}
