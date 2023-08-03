import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, filter, takeUntil } from 'rxjs';

import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';

@Component({
  selector: 'tamu-gisc-api',
  templateUrl: './geoservices-api.component.html',
  styleUrls: ['./geoservices-api.component.scss']
})
export class GeoservicesApiComponent implements OnInit, OnDestroy {
  @ViewChild('scrollContainer', { static: true })
  private container: ElementRef;

  public mobile: Observable<boolean>;
  public mobileNavToggle: Subject<boolean> = new Subject();

  private _$destroy: Subject<boolean> = new Subject();

  constructor(private readonly rs: ResponsiveService, private readonly rt: Router) {}
  public ngOnInit(): void {
    this.mobile = this.rs.isMobile;

    // Because we are using an abnormal layout, we need to manually scroll to the top of the page on navigation.
    this.rt.events
      .pipe(
        filter((event) => event.constructor.name === 'NavigationEnd'),
        takeUntil(this._$destroy)
      )
      .subscribe(() => {
        this.container.nativeElement.scrollTop = 0;
      });
  }

  public ngOnDestroy(): void {
    this._$destroy.next(true);
    this._$destroy.complete();
  }
}
