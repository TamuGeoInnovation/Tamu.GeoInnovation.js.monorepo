import { Injectable } from '@angular/core';
import { ReplaySubject, merge, of, shareReplay, switchMap, withLatestFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CorrectionService {
  public dataPopulated: ReplaySubject<boolean> = new ReplaySubject(1);
  public selectedRow: ReplaySubject<Record<string, unknown>> = new ReplaySubject(1);
  public correctionPoint: ReplaySubject<GeocodePoint> = new ReplaySubject(1);
  public correctionAltGeocode: ReplaySubject<AlternateGeocode> = new ReplaySubject(1);
  public correctionApplied: ReplaySubject<boolean> = new ReplaySubject(1);

  /**
   * Resolved correction from either a point or an alternate geocode.
   */
  public correction = merge(
    this.correctionPoint.pipe(
      withLatestFrom(this.selectedRow),
      switchMap(([point]) => {
        if (!point) {
          return of(null);
        }

        return of({
          NewLatitude: point.lat.toString(),
          NewLongitude: point.lon.toString(),
          NewQuality: 'Manual Correction',
          NewSource: 'TAMUGeocoder',
          QANotes: '',
          Updated: '',
          MicroMatchStatus: 'Interactive',
          PenaltyCode: 'XXXXXXXXXXXXXX',
          PenaltyCodeSummary: 'XXXXXXXXXXXXXX'
        } as GeocodeCorrection);
      })
    ),
    this.correctionAltGeocode.pipe(
      withLatestFrom(this.selectedRow),
      switchMap(([geocode]) => {
        if (!geocode) {
          return of(null);
        }

        return of({
          NewLatitude: geocode['Latitude'],
          NewLongitude: geocode['Longitude'],
          NewQuality: geocode['GeocodeQualityType'],
          NewSource: geocode['Source'],
          QANotes: '',
          Updated: '',
          MicroMatchStatus: 'Interactive',
          PenaltyCode: 'XXXXXXXXXXXXXX',
          PenaltyCodeSummary: 'XXXXXXXXXXXXXX'
        } as GeocodeCorrection);
      })
    )
  ).pipe(shareReplay(1));

  public notifyDataPopulated() {
    this.dataPopulated.next(true);
  }

  public selectRow(row: Record<string, unknown>) {
    this.selectedRow.next(row);
    this.correctionPoint.next(null);
    this.correctionAltGeocode.next(null);
  }

  public recordMapPoint(point: { lat: number; lon: number }) {
    this.correctionPoint.next(point);
  }

  public recordAltGeocode(geocode: AlternateGeocode) {
    this.correctionAltGeocode.next(geocode);
  }

  public notifyApplyCorrection() {
    this.correctionApplied.next(true);
  }
}

interface GeocodeCorrection {
  NewLatitude: string;
  NewLongitude: string;
  NewAddress?: string;
  NewCity?: string;
  NewQuality: string;
  NewState?: string;
  NewSource: string;
  NewZip?: string;
}

export interface GeocodePoint {
  lat: number | string;
  lon: number | string;
}

export interface AlternateGeocode {
  Source: string;
  Latitude: string;
  Longitude: string;
}
