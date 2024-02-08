import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TableService {
  private _data: Array<Record<string, unknown>> = [];
}
