import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Angulartics2 } from 'angulartics2';

@Component({
  selector: 'tamu-gisc-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.scss']
})
export class IntroComponent {
  constructor(private readonly router: Router, private readonly anl: Angulartics2) {}

  public next() {
    this.anl.eventTrack.next({
      action: 'navigate',
      properties: {
        category: 'builder',
        gstCustom: {
          origin: 'intro',
          dest: 'date'
        }
      }
    });

    this.router.navigate(['builder/date']);
  }
}
