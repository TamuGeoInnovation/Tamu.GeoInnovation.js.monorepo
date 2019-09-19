import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';
import { RouterHistoryService } from '../../../../../services/router-history.service';

@Component({
  selector: 'modal',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss']
})
export class ModalComponent implements OnInit, OnDestroy {
  public isMobile: boolean;

  private _lastRoute: string;

  private _destroy$: Subject<boolean> = new Subject();

  constructor(
    private router: Router,
    private history: RouterHistoryService,
    private location: Location,
    private responsiveService: ResponsiveService
  ) {}

  public ngOnInit() {
    this.isMobile = this.responsiveService.snapshot.isMobile;

    this.history
      .last()
      .pipe(takeUntil(this._destroy$))
      .subscribe((event: any) => {
        this._lastRoute = event.url;
      });
  }

  public ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  public close() {
    if (this._lastRoute) {
      this.router.navigate([this._lastRoute]);
    } else {
      this.location.back();
    }
  }
}
