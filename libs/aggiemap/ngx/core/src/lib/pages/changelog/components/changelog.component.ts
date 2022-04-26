import { Component } from '@angular/core';

import { events } from '../changelog-events';

@Component({
  selector: 'tamu-gisc-aggiemap-changelog',
  templateUrl: './changelog.component.html',
  styleUrls: ['./changelog.component.scss']
})
export class ChangelogComponent {
  public changelogEvents = events;
}
