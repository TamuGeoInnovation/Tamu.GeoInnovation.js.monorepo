import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';

import { ActiveLockdown, LockdownsService } from '../../../../data-access/lockdowns/lockdowns.service';

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
