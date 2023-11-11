import { Component, Input, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, distinctUntilChanged, shareReplay, startWith } from 'rxjs/operators';

@Component({
  selector: 'tamu-gisc-mobile-nav-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.scss']
})
export class MobileTabNavigationTabComponent implements OnInit {
  @Input()
  public route: string;

  @Input()
  public icon: string;

  @Input()
  public label: string;

  public activeTab: Observable<boolean>;

  @HostListener('click', ['$event'])
  public navigate() {
    this.router.navigate([this.route]);
  }

  constructor(private router: Router) {}

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
