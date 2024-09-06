import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { shareReplay, map } from 'rxjs/operators';

import { Lockdown } from '@tamu-gisc/covid/common/entities';

import { LockdownsService } from '../../../../data-access/lockdowns/lockdowns.service';

@Component({
  selector: 'tamu-gisc-lockdown-infos-list',
  templateUrl: './lockdown-infos-list.component.html',
  styleUrls: ['./lockdown-infos-list.component.scss']
})
export class LockdownInfosListComponent implements OnInit {
  @Input()
  public lockdownGuid: string;

  public infos: Observable<Partial<Lockdown>>;

  constructor(private rt: ActivatedRoute, private ls: LockdownsService) {}

  public ngOnInit(): void {
    const guid = this.lockdownGuid !== undefined ? this.lockdownGuid : this.rt.snapshot.params.guid;

    this.infos = this.ls.getLockdownInfos(guid).pipe(
      map((lockdown) => {
        lockdown.infos = lockdown.infos.sort(
          (a, b) => Date.parse(b.created as unknown as string) - Date.parse(a.created as unknown as string)
        );
        return lockdown;
      }),
      shareReplay(1)
    );
  }
}
