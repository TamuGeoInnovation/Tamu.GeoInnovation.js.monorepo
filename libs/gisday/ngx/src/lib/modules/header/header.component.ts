import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '@tamu-gisc/gisday/data-access';

import { ITokenIntrospectionResponse, IUserInfoResponse } from '@tamu-gisc/gisday/data-access';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  private modal: HTMLElement;
  public loggedIn: Observable<ITokenIntrospectionResponse>;
  public userRole: Observable<IUserInfoResponse>;
  public isActive: boolean = false;
  public account: Account;

  constructor(private readonly authService: AuthService) {}

  ngOnInit() {
    this.loggedIn = this.authService.state();
    this.userRole = this.authService.getUserRole();
  }

  toggleMenuButton() {
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

  toggleModalBg(on: boolean) {
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
