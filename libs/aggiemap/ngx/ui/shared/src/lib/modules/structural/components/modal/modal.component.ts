import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router, RouterEvent, RouterOutlet } from '@angular/router';
import { Location } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';
import { RouterHistoryService } from '@tamu-gisc/common/ngx/router';
import { BackdropComponent } from '../backdrop/backdrop.component';

@Component({
  selector: 'tamu-gisc-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterOutlet, BackdropComponent]
})
export class ModalComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private history = inject(RouterHistoryService);
  private location = inject(Location);
  private responsiveService = inject(ResponsiveService);

  public isMobile: boolean;

  private _lastRoute: string;

  private _destroy$: Subject<boolean> = new Subject();

  public ngOnInit() {
    this.isMobile = this.responsiveService.snapshot.isMobile;

    this.history
      .last()
      .pipe(takeUntil(this._destroy$))
      .subscribe((event: RouterEvent) => {
        this._lastRoute = event.url;
      });
  }

  public ngOnDestroy() {
    this._destroy$.next(undefined);
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
