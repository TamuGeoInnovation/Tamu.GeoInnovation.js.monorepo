import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CorrectionService {
  public dataPopulated: ReplaySubject<boolean> = new ReplaySubject(1);
  public selectedRow: ReplaySubject<Record<string, unknown>> = new ReplaySubject(1);
  public correctionPoint: ReplaySubject<{ lat: number; lon: number }> = new ReplaySubject(1);
  public correctionApplied: ReplaySubject<boolean> = new ReplaySubject(1);

  public notifyDataPopulated() {
    this.dataPopulated.next(true);
  }

  public selectRow(row: Record<string, unknown>) {
    this.selectedRow.next(row);
    this.correctionPoint.next(null);
  }

  public recordMapPoint(point: { lat: number; lon: number }) {
    this.correctionPoint.next(point);
  }

  public notifyApplyCorrection() {
    this.correctionApplied.next(true);
  }
}
