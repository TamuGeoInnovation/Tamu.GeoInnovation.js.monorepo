import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
// import { AccountService, Account } from '../../modules/services/account.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  // @ViewChild('menuButton') menuButton: ElementRef;
  private modal: HTMLElement;
  public isActive: boolean = false;
  // public account: Observable<Account>;
  public account: Account;

  constructor() {}

  ngOnInit() {}

  toggleMenuButton() {}

  toggleModalBg(on: boolean) {}
}
