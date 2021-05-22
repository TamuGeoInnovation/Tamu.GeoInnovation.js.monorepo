import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  constructor() {}

  public getExisting() {
    const mock: Array<DatabaseRecord> = [
      {
        name: 'Edher | customer_addre.csv',
        type: 'csv',
        date: Date.now(),
        size: '215 B',
        status: 'ready'
      },
      {
        name: 'Edher | shipping_centrs.csv',
        type: 'csv',
        date: Date.now(),
        size: '1.35 MB',
        status: 'processing'
      }
    ];

    return of(mock);
  }

  public getTextDelimiterList(): Observable<Array<TextOptions>> {
    const list: Array<TextOptions> = [
      {
        name: 'Comma (,)',
        character: ','
      },
      {
        name: 'Tab (  )',
        character: '  '
      },
      {
        name: 'Bar (|)',
        character: '|'
      },
      {
        name: 'Semicolon (;)',
        character: ';'
      },
      {
        name: 'Space ( )',
        character: ' '
      }
    ];

    return of(list);
  }

  public getTextQualifierList(): Observable<Array<TextOptions>> {
    const list: Array<TextOptions> = [
      {
        name: 'None',
        character: undefined
      },
      {
        name: 'Double quote (")',
        character: '"'
      },
      {
        name: "Single quote (')",
        character: "'"
      }
    ];

    return of(list);
  }
}

export interface DatabaseRecord {
  name: string;
  type: 'csv' | 'text' | 'access-2007' | 'access';
  date: number;
  size: string;
  status: 'ready' | 'processing';
}

export interface TextOptions {
  name: string;
  character: string;
}
