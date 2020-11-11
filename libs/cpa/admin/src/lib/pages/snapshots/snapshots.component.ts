import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivationEnd, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, shareReplay, startWith } from 'rxjs/operators';

@Component({
  selector: 'tamu-gisc-snapshots',
  templateUrl: './snapshots.component.html',
  styleUrls: ['./snapshots.component.scss']
})
export class SnapshotsComponent implements OnInit {
  public entityView: Observable<boolean>;

  constructor(private router: Router, private location: Location) {}

  public ngOnInit(): void {
    this.entityView = this.router.events.pipe(
      filter((event) => {
        return event instanceof ActivationEnd;
      }),
      map(() => {
        return this.location.path(true);
      }),
      startWith(this.location.path(true)),
      distinctUntilChanged(),
      map((path) => {
        const keywords = ['edit', 'create'];
        const hasKeyword = keywords.some((word) => path.includes(word));

        return hasKeyword;
      }),
      shareReplay()
    );
  }
}
