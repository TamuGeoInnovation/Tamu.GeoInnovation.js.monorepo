import { Component, OnInit } from '@angular/core';

import { ViewerService } from '../../services/viewer.service';

@Component({
  selector: 'tamu-gisc-snapshot-navigator',
  templateUrl: './snapshot-navigator.component.html',
  styleUrls: ['./snapshot-navigator.component.scss']
})
export class SnapshotNavigatorComponent implements OnInit {
  constructor(private vs: ViewerService) {}

  public ngOnInit(): void {
    // this.vs.workshop.subscribe((w) => {
    //   debugger;
    // });
  }
}
