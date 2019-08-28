import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { pluck } from 'rxjs/operators';

const _initialState: TestingSTore = { isTesting: false };

@Injectable()
export class TestingService {
  private _store: BehaviorSubject<TestingSTore> = new BehaviorSubject(_initialState);
  public store: Observable<TestingSTore> = this._store.asObservable();

  constructor() {
    this._determineTestingMode();
  }

  public get(property: string) {
    return this.store.pipe(pluck(property));
  }

  public set(property: string, value: any) {
    const state = { ...this._store.value, [property]: value };

    this._store.next(state);
  }

  private _determineTestingMode() {
    if (window.location.host.includes('dev') || window.location.host.includes('localhost')) {
      this.set('isTesting', true);
    }
  }
}

interface TestingSTore {
  isTesting: boolean;
}
