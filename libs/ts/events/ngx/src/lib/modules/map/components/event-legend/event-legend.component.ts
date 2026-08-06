import { Component, OnInit } from '@angular/core';

import { EventSettingsService } from '../../../../services/settings/event-settings.service';
import { SidebarInfoPanel } from '../../../../interfaces/special-event.interface';

@Component({
  selector: 'tamu-gisc-event-legend',
  templateUrl: './event-legend.component.html',
  styleUrls: ['./event-legend.component.scss']
})
export class EventLegendComponent implements OnInit {
  public deduplicate = true;
  public respectDefinitionExpression = true;
  public allowVisibilityToggle = true;
  public combineChildrenUnderPrimary = false;
  public sidebarInfo: SidebarInfoPanel | undefined;

  constructor(private readonly eventSettingsService: EventSettingsService) {}

  public ngOnInit(): void {
    const config = this.eventSettingsService.eventConfiguration()?.configuration;

    this.allowVisibilityToggle = config?.legendAllowVisibilityToggle ?? true;
    this.combineChildrenUnderPrimary = config?.legendCombineChildrenUnderPrimary ?? false;
    this.sidebarInfo = config?.sidebarInfo;
  }
}
