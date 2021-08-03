import { Component, ElementRef, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, interval, Observable, of } from 'rxjs';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';

import { TypedSnapshotOrScenario, ViewerService } from '../../services/viewer.service';

@Component({
  selector: 'tamu-gisc-snapshot-navigator',
  templateUrl: './snapshot-navigator.component.html',
  styleUrls: ['./snapshot-navigator.component.scss']
})
export class SnapshotNavigatorComponent implements OnInit {
  public snapshots: Observable<Array<TypedSnapshotOrScenario>> = this.vs.snapshotsAndScenarios;
  public index: Observable<number> = this.vs.selectionIndex;

  /**
   * Represents the inner width of the navigator component
   */
  public innerWidth: Observable<number>;

  /**
   * Represents the width of the time line (the actual line going through snapshot and scenario icons).
   * 
   * This width is never larger than the innerWidth
   */
  public timelineWidth: Observable<number>;

  /**
   * Represents a left offset for the time line (actual line) so that it displays centered
   */
  public timelineLeftOffset: Observable<number>;

  constructor(public router: ActivatedRoute, private vs: ViewerService, private el: ElementRef) {}

  @HostBinding('style.maxWidth')
  public get maxContainerWidth() {
    return `${window.innerWidth - window.innerWidth * 0.2}px`;
  }

  public ngOnInit(): void {
    this.innerWidth = interval(500).pipe(
      switchMap(() => {
        return of(Math.floor((this.el.nativeElement as HTMLElement).scrollWidth));
      }),
      distinctUntilChanged()
    );

    this.timelineWidth = this.innerWidth.pipe(
      map((n) => {
        return n - 75;
      })
    );

    this.timelineLeftOffset = combineLatest([this.innerWidth, this.timelineWidth]).pipe(
      map(([inner, timeline]) => {
        return (inner - timeline) / 2;
      })
    );
  }

  public navigate(index: number) {
    this.vs.updateSelectionIndex(index);
  }
}
