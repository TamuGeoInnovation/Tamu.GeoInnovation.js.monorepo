import { Component, Input, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'tamu-gisc-mobile-nav-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.scss']
})
export class MobileTabNavigationTab {
  @Input()
  public route: string;

  @HostListener('click', ['$event'])
  public navigate(event: MouseEvent) {
    this.router.navigate([this.route]);
  }

  constructor(private router: Router) {}
}
