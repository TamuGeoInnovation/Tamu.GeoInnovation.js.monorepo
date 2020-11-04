import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';

import { AuthService } from '@tamu-gisc/gisday/data-access';
import { RouterHistoryService } from '@tamu-gisc/common/ngx/router';

import { ITokenIntrospectionResponse, IUserInfoResponse } from '@tamu-gisc/gisday/data-access';
import { Location } from '@angular/common';
@Component({
  selector: 'tamu-gisc-app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  public loggedIn: Observable<boolean>;
  public userRole: Observable<IUserInfoResponse>;

  public account: Account;
  public isActive = false;
  public logoVisible: Observable<boolean>;

  private modal: HTMLElement;

  constructor(private authService: AuthService, private location: Location, private routerHistory: RouterHistoryService) {}

  public ngOnInit() {
    this.loggedIn = this.authService.getHeaderState().pipe(shareReplay(1));

    this.logoVisible = this.routerHistory.history.pipe(
      map(() => {
        return this.location.path() !== '';
      }),
      shareReplay()
    );

    // this.userRole = this.authService.getUserRole();
    // this.authService.state().subscribe((result) => {
    //   console.log(result);
    // });
    // this.authService.getUserRole().subscribe((result) => {
    //   console.log(result);
    // });
  }

  public toggleMenuButton() {
    this.isActive = !this.isActive;
    const body = document.querySelector('body');
    if (this.isActive) {
      body.classList.add('modal-open');
      this.toggleModalBg(true);
    } else {
      body.classList.remove('modal-open');
      this.toggleModalBg(false);
    }
  }

  public toggleModalBg(on: boolean) {
    const htmlChildren = document.documentElement.children;
    const body = htmlChildren.item(1);
    const section = body.children
      .item(0)
      .children.item(2)
      .children.item(0);
    if (on) {
      this.modal = document.createElement('div');
      this.modal.classList.add('active');
      this.modal.id = 'modal-bg';
      section.appendChild(this.modal);
    } else {
      section.removeChild(this.modal);
    }
  }
}
