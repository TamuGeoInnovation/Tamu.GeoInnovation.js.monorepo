import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Angulartics2 } from 'angulartics2';

import { EventSettingsService } from '../../../../services/settings/event-settings.service';
import { EventConfiguration } from '../../../../interfaces/special-event.interface';
import { BuilderModuleBaseComponent } from '../builder-module-base/builder-module-base.component';

@Component({
  selector: 'tamu-gisc-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.scss', '../builder-module-base/builder-module-base.component.scss']
})
export class IntroComponent extends BuilderModuleBaseComponent implements OnInit {
  public settings: EventConfiguration | null;

  constructor(
    private readonly router: Router,
    private readonly rt: ActivatedRoute,
    private readonly anl: Angulartics2,
    private readonly es: EventSettingsService
  ) {
    super();
  }

  public ngOnInit(): void {
    this.settings = this.es.eventConfiguration()?.configuration ?? null;
  }

  public next() {
    const builderStartStep = this.settings?.builderStartStep ?? 'accommodations';

    if (builderStartStep === 'review') {
      this.es.ensureDefaultOptionSettings();
    }

    this.anl.eventTrack.next({
      action: 'navigate',
      properties: {
        category: 'builder',
        gstCustom: {
          origin: 'intro',
          dest: builderStartStep
        }
      }
    });

    this.router.navigate([`../${builderStartStep}`], {
      relativeTo: this.rt.parent
    });
  }
}
