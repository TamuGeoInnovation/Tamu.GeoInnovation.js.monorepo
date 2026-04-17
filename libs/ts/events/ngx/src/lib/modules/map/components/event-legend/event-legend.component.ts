import { Component, OnInit } from '@angular/core';

import { EventSettingsService } from '../../../../services/settings/event-settings.service';

@Component({
  selector: 'tamu-gisc-event-legend',
  templateUrl: './event-legend.component.html'
})
export class EventLegendComponent implements OnInit {
  public deduplicate = true;
  public respectDefinitionExpression = true;
  public allowVisibilityToggle = true;
  public combineChildrenUnderPrimary = false;
  public excludedLayerIds: string[] = [];

  constructor(private readonly eventSettingsService: EventSettingsService) {}

  public ngOnInit(): void {
    const config = this.eventSettingsService.eventConfiguration()?.configuration;

    this.allowVisibilityToggle = config?.legendAllowVisibilityToggle ?? true;
    this.combineChildrenUnderPrimary = config?.legendCombineChildrenUnderPrimary ?? false;
    this.excludedLayerIds = config?.legendExcludedLayerIds ?? [];
  }
}
