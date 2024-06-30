import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'tamu-gisc-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.scss']
})
export class IntroComponent {
  constructor(private readonly router: Router) {}

  public next() {
    this.router.navigate(['builder/date']);
  }
}
