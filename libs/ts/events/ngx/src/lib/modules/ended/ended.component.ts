import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { EventSettingsService } from '../../services/settings/event-settings.service';

/**
 * Shown instead of a retired event's map (#1098): the event is over, so its map is no longer offered.
 * `RetiredEventGuard` sends a retired event's links here.
 */
@Component({
  selector: 'tamu-gisc-event-ended',
  templateUrl: './ended.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink]
})
export class EndedComponent {
  public readonly name: string;

  constructor(route: ActivatedRoute, eventSettingsService: EventSettingsService) {
    const eventId = route.snapshot.pathFromRoot.find((snapshot) => snapshot.params['eventId'])?.params['eventId'];
    const configuration = eventSettingsService.getEventDefinitionById(eventId)?.configuration;

    this.name = configuration?.name ?? 'This event';
  }
}
