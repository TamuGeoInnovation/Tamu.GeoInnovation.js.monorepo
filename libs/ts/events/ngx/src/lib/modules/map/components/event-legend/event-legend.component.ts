import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';

import { EventSettingsService } from '../../../../services/settings/event-settings.service';
import { SidebarInfoPanel } from '../../../../interfaces/special-event.interface';
import { NgStyle } from '@angular/common';
import { LegendModule } from '@tamu-gisc/maps/feature/legend';

@Component({
  selector: 'tamu-gisc-event-legend',
  templateUrl: './event-legend.component.html',
  styleUrls: ['./event-legend.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [NgStyle, LegendModule]
})
export class EventLegendComponent implements OnInit {
  private readonly eventSettingsService = inject(EventSettingsService);

  public deduplicate = true;
  public respectDefinitionExpression = true;
  public allowVisibilityToggle = true;
  public combineChildrenUnderPrimary = false;
  public sidebarInfo: SidebarInfoPanel | undefined;

  public ngOnInit(): void {
    const config = this.eventSettingsService.eventConfiguration()?.configuration;

    this.allowVisibilityToggle = config?.legendAllowVisibilityToggle ?? true;
    this.combineChildrenUnderPrimary = config?.legendCombineChildrenUnderPrimary ?? false;
    this.sidebarInfo = config?.sidebarInfo;
  }
}
