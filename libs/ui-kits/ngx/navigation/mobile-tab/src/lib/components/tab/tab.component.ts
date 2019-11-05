import { Component, Input, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, distinctUntilChanged, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'tamu-gisc-mobile-nav-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.scss']
})
export class MobileTabNavigationTab implements OnInit {
  @Input()
  public route: string;

  @Input()
  public icon: string;

  @Input()
  public label: string;

  public activeTab: Observable<boolean>;

  @HostListener('click', ['$event'])
  public navigate(event: MouseEvent) {
    this.router.navigate([this.route]);
  }

  constructor(private router: Router) {}

  public ngOnInit() {
    this.activeTab = this.router.events.pipe(
      switchMap((e) => {
        return of(this.router.isActive(this.route, false));
      }),
      distinctUntilChanged(),
      shareReplay(1)
    );
  }
}
