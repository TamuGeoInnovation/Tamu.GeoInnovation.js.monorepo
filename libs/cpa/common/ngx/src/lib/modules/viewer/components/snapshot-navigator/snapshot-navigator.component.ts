import { Component, ElementRef, HostBinding, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { combineLatest, fromEvent, interval, Observable, of } from 'rxjs';
import { distinctUntilChanged, map, startWith, switchMap, take } from 'rxjs/operators';

import { TypedSnapshotOrScenario, ViewerService } from '../../services/viewer.service';

@Component({
  selector: 'tamu-gisc-snapshot-navigator',
  templateUrl: './snapshot-navigator.component.html',
  styleUrls: ['./snapshot-navigator.component.scss']
})
export class SnapshotNavigatorComponent implements OnInit {
  public snapshots: Observable<Array<TypedSnapshotOrScenario>> = this.vs.snapshotsAndScenarios;
  public selection: Observable<TypedSnapshotOrScenario> = this.vs.snapshotOrScenario;

  /**
   * Represents the inner width of the navigator component (including scrolling width)
   */
  public innerWidth: Observable<number>;

  /**
   * Represents the outer width of the navigator component (physical foot print, excluding scrolling width)
   */
  public outerWidth: Observable<number>;

  /**
   * Represents the width of the time line (the actual line going through snapshot and scenario icons).
   *
   * This width is never larger than the innerWidth
   */
  public timelineWidth: Observable<number>;

  /**
   * Represents a left offset for the time line (actual line) so that it displays centered
   * relative to the scroll width.
   */
  public timelineLeftOffset: Observable<number>;

  /**
   * Represents the left scrolling position of the timeline
   */
  public timelineScrollPosition: Observable<number>;

  /**
   * Visibility status for both left and right secondary scrolling mechanisms.
   */
  public scrollerVisibility: {
    left: Observable<boolean>;
    right: Observable<boolean>;
  };

  @ViewChild('innerContainer', { static: true })
  public innerContainer: ElementRef;

  constructor(private vs: ViewerService, private router: Router, private el: ElementRef) {}

  @HostBinding('style.maxWidth')
  public get maxContainerWidth() {
    return `${window.innerWidth - window.innerWidth * 0.2}px`;
  }

  public ngOnInit(): void {
    const timer = interval(1000);

    this.innerWidth = timer.pipe(
      switchMap(() => {
        return of(Math.floor((this.innerContainer.nativeElement as HTMLElement).scrollWidth));
      }),
      distinctUntilChanged()
    );

    this.outerWidth = timer.pipe(
      switchMap(() => {
        return of((this.innerContainer.nativeElement as HTMLElement).clientWidth);
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

    this.timelineScrollPosition = fromEvent(this.innerContainer.nativeElement, 'scroll').pipe(
      map((event: Event) => {
        return (event.currentTarget as HTMLElement).scrollLeft;
      }),
      startWith(0)
    );

    this.scrollerVisibility = {
      left: this.timelineScrollPosition.pipe(
        map((position) => {
          return position - 50 > 0;
        })
      ),
      right: combineLatest([this.timelineScrollPosition, this.outerWidth, this.innerWidth]).pipe(
        map(([position, outer, inner]) => {
          return position < inner - outer - 50;
        })
      )
    };
  }

  public navigate(guid: string): void {
    this.vs.workshop.pipe(take(1)).subscribe((ws) => {
      this.router.navigate(['/viewer/workshop', ws.guid, guid]);
    });
  }

  public scroll(direction: 'left' | 'right'): void {
    const element: HTMLElement = this.innerContainer.nativeElement;
    const sign = direction === 'left' ? -1 : 1;
    const scrollAmount = 350;

    // Scroll smoothly in a negative or positive horizontal direction by adding or subtracting from current
    // left scroll position
    element.scrollTo({ left: element.scrollLeft + sign * scrollAmount, behavior: 'smooth' });
  }
}
