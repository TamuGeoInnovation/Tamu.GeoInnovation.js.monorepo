import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { DatabaseService, DatabaseRecord } from '@tamu-gisc/geoservices/data-access';
import { AsyncPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'tamu-gisc-uploaded',
  templateUrl: './uploaded.component.html',
  styleUrls: ['./uploaded.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink, AsyncPipe, DatePipe]
})
export class UploadedComponent implements OnInit {
  private db = inject(DatabaseService);
  route = inject(ActivatedRoute);

  public databases: Observable<Array<DatabaseRecord>>;

  public ngOnInit() {
    this.databases = this.db.getExisting().pipe(shareReplay(1));
  }
}
