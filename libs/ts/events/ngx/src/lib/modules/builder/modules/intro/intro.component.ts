import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Angulartics2 } from 'angulartics2';

import { EventSettingsService } from '../../../../services/settings/event-settings.service';
import { EventConfiguration } from '../../../../interfaces/special-event.interface';
import { BuilderModuleBaseComponent } from '../builder-module-base/builder-module-base.component';

@Component({
  selector: 'tamu-gisc-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.scss', '../builder-module-base/builder-module-base.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager
})
export class IntroComponent extends BuilderModuleBaseComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly rt = inject(ActivatedRoute);
  private readonly anl = inject(Angulartics2);
  private readonly es = inject(EventSettingsService);

  public settings: EventConfiguration | null;

  public ngOnInit(): void {
    this.settings = this.es.eventConfiguration()?.configuration;
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
