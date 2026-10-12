import { Component } from '@angular/core';
import { RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'tamu-gisc-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  imports: [RouterLinkActive, RouterLink, RouterOutlet]
})
export class AccountComponent {}
