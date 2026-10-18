import { Component, OnInit, inject } from '@angular/core';

import { EventSettingsService } from '../../services/settings/event-settings.service';
import { EventConfiguration } from '../../interfaces/special-event.interface';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'tamu-gisc-builder',
  templateUrl: './builder.component.html',
  styleUrls: ['./builder.component.scss'],
  imports: [RouterOutlet]
})
export class BuilderComponent implements OnInit {
  private readonly settings = inject(EventSettingsService);

  public config: EventConfiguration | null;

  public ngOnInit(): void {
    this.config = this.settings.eventConfiguration()?.configuration;
  }
}
