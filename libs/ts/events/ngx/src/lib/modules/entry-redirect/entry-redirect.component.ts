import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { EventSettingsService } from '../../services/settings/event-settings.service';

@Component({
  selector: 'tamu-gisc-entry-redirect',
  template: ''
})
export class EntryRedirectComponent implements OnInit {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly eventSettingsService: EventSettingsService
  ) {}

  public ngOnInit(): void {
    this.eventSettingsService.validateEventQueryParams(this.route.snapshot, true);

    // Maps without configurable options should open directly to the map instead of showing an intro-only builder.
    const targetCommands = this.eventSettingsService.hasOptions ? ['builder', 'accommodations'] : ['map'];

    this.router.navigate(targetCommands, {
      relativeTo: this.route.parent ?? this.route,
      queryParams: this.route.snapshot.queryParams,
      fragment: this.route.snapshot.fragment ?? undefined,
      replaceUrl: true
    });
  }
}
