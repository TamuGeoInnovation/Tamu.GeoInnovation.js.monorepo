import { Component, OnInit } from '@angular/core';

import { EventSettingsService } from '../../../../services/settings/event-settings.service';

@Component({
  selector: 'tamu-gisc-event-legend',
  templateUrl: './event-legend.component.html'
})
export class EventLegendComponent implements OnInit {
  private readonly _physicsEventId = 'phys-eng-fest';

  private readonly _physicsExcludedLayerIds = [
    'aggieprint-locations-layer',
    'accessible-entrances-layer',
    'visitor-parking-layer',
    'lactation-rooms-layer',
    'poi-layer',
    'construction_zone-layer',
    'dining-locations-layer',
    'single-occupancy-restroom-locations-layer',
    'emergency-phones-layer'
  ];

  public deduplicate = true;
  public respectDefinitionExpression = true;
  public allowVisibilityToggle = false;
  public combineChildrenUnderPrimary = false;
  public excludedLayerIds: string[] = [];

  constructor(private readonly eventSettingsService: EventSettingsService) {}

  public ngOnInit(): void {
    const eventId = this.eventSettingsService.eventConfiguration()?.configuration?.id;
    const isPhysicsMap = eventId === this._physicsEventId;

    this.allowVisibilityToggle = isPhysicsMap;
    this.combineChildrenUnderPrimary = isPhysicsMap;
    this.excludedLayerIds = isPhysicsMap ? this._physicsExcludedLayerIds : [];
  }
}
