import { Component, OnInit } from '@angular/core';
import { map, ReplaySubject } from 'rxjs';

@Component({
  selector: 'tamu-gisc-release-info',
  templateUrl: './release-info.component.html',
  styleUrls: ['./release-info.component.scss']
})
export class ReleaseInfoComponent implements OnInit {
  public release_meta: ReleaseInfo;

  public ngOnInit(): void {
    this.release_meta = new ReleaseInfo({
      release: 'DEFAULT',
      machine_name: 'DEFAULT'
    });
  }
}

export class ReleaseInfo {
  private _args: ReplaySubject<ReleaseMetaData> = new ReplaySubject(1);
  public args = this._args.asObservable();

  public isRelease = this.args.pipe(
    map((a: ReleaseMetaData) => {
      return a.release !== 'DEFAULT';
    })
  );

  constructor(a: ReleaseMetaData) {
    this._args.next(a);
  }
}

export interface ReleaseMetaData {
  release: string;
  machine_name: string;
}
