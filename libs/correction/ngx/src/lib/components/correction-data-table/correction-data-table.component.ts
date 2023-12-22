import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Observable, race, ReplaySubject, switchMap, tap } from 'rxjs';

import * as papa from 'papaparse';

import { TableConfig } from '@tamu-gisc/ui-kits/ngx/layout/tables';
import { EsriMapService } from '@tamu-gisc/maps/esri';

import { DbService } from '../../services/db.service';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-correction-data-table',
  templateUrl: './correction-data-table.component.html',
  styleUrls: ['./correction-data-table.component.scss']
})
export class CorrectionDataTableComponent implements OnInit {
  private _file: ReplaySubject<File> = new ReplaySubject();

  public file = this._file.asObservable();
  public db: Observable<IDBDatabase>;
  public contents: Observable<Array<Record<string, unknown>>>;
  public config: TableConfig = [
    {
      name: 'ID',
      prop: 'ID'
    },
    {
      name: 'Address',
      prop: 'Address'
    },
    {
      name: 'City',
      prop: 'City'
    },
    {
      name: 'State',
      prop: 'State'
    },
    {
      name: 'Zip',
      prop: 'Zip'
    },
    {
      name: 'Latitude',
      prop: 'Latitude'
    },
    {
      name: 'Longitude',
      prop: 'Longitude'
    },
    {
      name: 'Penalty Code',
      prop: 'PenaltyCode'
    },
    {
      name: 'Penalty Summary',
      prop: 'PenaltyCodeSummary'
    }
  ];

  @Output()
  public dataPopulated: EventEmitter<boolean> = new EventEmitter();

  @Output()
  public rowSelected: EventEmitter<Record<string, unknown>> = new EventEmitter();

  constructor(private readonly ds: DbService, private es: EsriMapService) {}

  public ngOnInit(): void {
    this.db = race(
      this.file.pipe(
        switchMap((file) =>
          this._parseCsv(file).pipe(
            switchMap((data) => this.ds.initDb({ name: 'corrections', version: 1, createSchemaFromData: true, data }))
          )
        )
      ),
      this.ds.openDatabase('corrections')
    );

    this.contents = this.db.pipe(
      switchMap(() => this.ds.getN(250)),
      tap(() => {
        this.dataPopulated.emit(true);
      })
    );
  }

  public doThing(e: File) {
    this._file.next(e);
  }

  public async focusRow(row: Record<string, unknown>) {
    const layerId = 'geocoded-original';

    const layer = (await this.es.findLayerOrCreateFromSource({
      type: 'graphics',
      id: layerId,
      title: 'Geocoded Original'
    })) as esri.GraphicsLayer;

    if (layer.graphics.length > 0) {
      layer.removeAll();
    }

    layer.add({
      geometry: {
        type: 'point',
        x: row['Longitude'],
        y: row['Latitude']
      } as esri.geometryPoint,
      symbol: {
        type: 'simple-marker',
        style: 'circle',
        color: 'red',
        size: 10,
        outline: {
          color: '#fafafa',
          width: 1
        }
      } as esri.SimpleMarkerSymbolProperties
    } as unknown as esri.Graphic);

    this.es.zoomTo({
      graphics: [...layer.graphics],
      zoom: 15
    });

    this.rowSelected.emit(row);
  }

  private _parseCsv(file: File): Observable<Array<Record<string, unknown>>> {
    return new Observable((observer) => {
      papa.parse(file, {
        header: true,
        complete: ({ data }) => {
          observer.next(data);
          observer.complete();
        }
      });
    });
  }
}
