import { Component, OnInit } from '@angular/core';
import { events } from '../changelog-events';

@Component({
  selector: 'gisc-changelog',
  templateUrl: './changelog.component.html',
  styleUrls: ['./changelog.component.scss']
})
export class ChangelogComponent implements OnInit {
  constructor() {}

  public events = events;

  public ngOnInit() {}
}
