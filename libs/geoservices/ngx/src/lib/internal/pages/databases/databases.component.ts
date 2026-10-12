import { Component } from '@angular/core';
import { RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'tamu-gisc-databases',
  templateUrl: './databases.component.html',
  styleUrls: ['./databases.component.scss'],
  imports: [RouterLinkActive, RouterLink, RouterOutlet]
})
export class DatabasesComponent {}
