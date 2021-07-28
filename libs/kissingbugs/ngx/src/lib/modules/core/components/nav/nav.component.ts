import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'tamu-gisc-kissingbugs-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit, OnDestroy {
  // TODO: Fix the template as right now the nav will disappear when you go mobile
  constructor() {}

  public ngOnInit(): void {}

  public ngOnDestroy(): void {}
}
