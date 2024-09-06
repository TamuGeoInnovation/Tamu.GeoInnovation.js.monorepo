import { Component, OnInit } from '@angular/core';
import { map, ReplaySubject } from 'rxjs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Component({
  selector: 'tamu-gisc-release-info',
  templateUrl: './release-info.component.html',
  styleUrls: ['./release-info.component.scss']
})
export class ReleaseInfoComponent implements OnInit {
  public release_meta: ReleaseInfo;

  constructor(private readonly env: EnvironmentService) {}

  public ngOnInit(): void {
    this.release_meta = new ReleaseInfo({
      release: this.env.value('release_id', true) || null,
      machine_name: this.env.value('machine_name', true) || 'localhost',
      environment: this.env.value('environment_mode', true) || 'local'
    });
  }
}

export class ReleaseInfo {
  private _args: ReplaySubject<ReleaseMetaData> = new ReplaySubject(1);
  public args = this._args.asObservable();

  public isRelease = this.args.pipe(
    map((a: ReleaseMetaData) => {
      return a.release !== null;
    })
  );

  constructor(a: ReleaseMetaData) {
    this._args.next(a);
  }
}

export interface ReleaseMetaData {
  release: string;
  machine_name: string;
  environment: string;
}
