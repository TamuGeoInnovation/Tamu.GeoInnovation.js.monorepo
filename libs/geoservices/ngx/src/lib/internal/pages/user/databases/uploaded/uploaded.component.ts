import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { DatabaseService, DatabaseRecord } from '@tamu-gisc/geoservices/data-access';

@Component({
  selector: 'tamu-gisc-uploaded',
  templateUrl: './uploaded.component.html',
  styleUrls: ['./uploaded.component.scss']
})
export class UploadedComponent implements OnInit {
  public databases: Observable<Array<DatabaseRecord>>;

  constructor(private db: DatabaseService, public route: ActivatedRoute) {}

  public ngOnInit() {
    this.databases = this.db.getExisting().pipe(shareReplay(1));
  }
}
