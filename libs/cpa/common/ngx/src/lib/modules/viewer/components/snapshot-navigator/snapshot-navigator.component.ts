import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { IWorkshopRequestPayload } from '@tamu-gisc/cpa/data-api';

import { ViewerService } from '../../services/viewer.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'tamu-gisc-snapshot-navigator',
  templateUrl: './snapshot-navigator.component.html',
  styleUrls: ['./snapshot-navigator.component.scss'],
})
export class SnapshotNavigatorComponent implements OnInit {
  public workshop: Observable<IWorkshopRequestPayload> = this.vs.workshop;
  public snapshotIndex: Observable<number> = this.vs.snapshotIndex;

  constructor(public router: ActivatedRoute, private vs: ViewerService) {}

  public ngOnInit(): void {}

  public navigate(index: number) {
    this.vs.updateSnapshotIndex(index);
  }
}
