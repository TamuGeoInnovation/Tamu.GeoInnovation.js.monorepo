import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { DbService } from '../db/db.service';

@Injectable({
  providedIn: 'root'
})
export class CorrectionService {
  private _selectedRow: Subject<Record<string, unknown>> = new Subject();
  private _dataPopulated: Subject<boolean> = new Subject();
  private _recordedMapPoint: Subject<{ lat: number; lon: number }> = new Subject();

  public selectedRow = this._selectedRow.asObservable();
  public dataPopulated = this._dataPopulated.asObservable();
  public correctionPoint = this._recordedMapPoint.asObservable();

  constructor(private readonly db: DbService) {}

  public notifyDataPopulated() {
    this._dataPopulated.next(true);
  }

  public selectRow(row: Record<string, unknown>) {
    this._selectedRow.next(row);
    this._recordedMapPoint.next(null);
  }

  public recordMapPoint(point: { lat: number; lon: number }) {
    this._recordedMapPoint.next(point);
  }
}
