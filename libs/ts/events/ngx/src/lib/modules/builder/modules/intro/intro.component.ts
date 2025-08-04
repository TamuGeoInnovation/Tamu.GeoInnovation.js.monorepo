import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Angulartics2 } from 'angulartics2';

import { EventSettingsService } from '../../../../services/settings/event-settings.service';
import { EventConfiguration } from '../../../../interfaces/special-event.interface';

@Component({
  selector: 'tamu-gisc-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.scss']
})
export class IntroComponent implements OnInit {
  public settings: EventConfiguration | null;

  constructor(
    private readonly router: Router,
    private readonly anl: Angulartics2,
    private readonly es: EventSettingsService
  ) {}

  public ngOnInit(): void {
    this.settings = this.es.eventConfiguration()?.configuration;
  }

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
