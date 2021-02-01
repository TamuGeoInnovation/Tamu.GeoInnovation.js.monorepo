import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import { TypedSnapshotOrScenario, ViewerService } from '../../services/viewer.service';

@Component({
  selector: 'tamu-gisc-snapshot-navigator',
  templateUrl: './snapshot-navigator.component.html',
  styleUrls: ['./snapshot-navigator.component.scss']
})
export class SnapshotNavigatorComponent implements OnInit {
  public snapshots: Observable<Array<TypedSnapshotOrScenario>> = this.vs.snapshotsAndScenarios;
  public index: Observable<number> = this.vs.selectionIndex;

  constructor(public router: ActivatedRoute, private vs: ViewerService) {}

  public ngOnInit(): void {}

  public navigate(index: number) {
    this.vs.updateSelectionIndex(index);
  }
}
