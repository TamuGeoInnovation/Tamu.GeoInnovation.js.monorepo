import { Component, Input, HostListener, OnInit, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, distinctUntilChanged, shareReplay, startWith } from 'rxjs/operators';
import { MobileTabNavigationComponent } from '../container/container.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'tamu-gisc-mobile-nav-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MobileTabNavigationComponent, AsyncPipe]
})
export class MobileTabNavigationTabComponent implements OnInit {
  private router = inject(Router);

  @Input()
  public route: string;

  public readonly icon = input<string>(undefined);

  public readonly label = input<string>(undefined);

  public activeTab: Observable<boolean>;

  @HostListener('click')
  public navigate() {
    this.router.navigate([this.route]);
  }

  public ngOnInit() {
    this.activeTab = this.router.events.pipe(
      startWith(true),
      switchMap(() => {
        return of(
          this.router.isActive(this.route, {
            paths: 'subset',
            queryParams: 'subset',
            fragment: 'ignored',
            matrixParams: 'ignored'
          })
        );
      }),
      distinctUntilChanged(),
      shareReplay(1)
    );
  }
}
