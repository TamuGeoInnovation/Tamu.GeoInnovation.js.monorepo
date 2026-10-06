import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { EventSettingsService } from '../../services/settings/event-settings.service';
import { EventConfiguration } from '../../interfaces/special-event.interface';

@Component({
  selector: 'tamu-gisc-builder',
  templateUrl: './builder.component.html',
  styleUrls: ['./builder.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class BuilderComponent implements OnInit {
  public config: EventConfiguration | null;

  constructor(private readonly settings: EventSettingsService) {}

  public ngOnInit(): void {
    this.config = this.settings.eventConfiguration()?.configuration;
  }
}
