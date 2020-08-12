import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { pluck } from 'rxjs/operators';

const _initialState: TestingStore = { isTesting: false, next: false };

@Injectable({ providedIn: 'root' })
export class TestingService {
  private _store: BehaviorSubject<TestingStore> = new BehaviorSubject(_initialState);
  public store: Observable<TestingStore> = this._store.asObservable();

  constructor() {
    this._determineTestingMode();
  }

  public get(property: keyof TestingStore) {
    return this.store.pipe(pluck(property));
  }

  public set(property: string, value: unknown) {
    const state = { ...this._store.value, [property]: value };

    this._store.next(state);
  }

  private _determineTestingMode() {
    if (window.location.host.includes('dev') || window.location.host.includes('localhost')) {
      this.set('isTesting', true);
    }

    if (window.location.href.includes('next')) {
      this.set('next', true);
    }
  }
}

interface TestingStore {
  isTesting: boolean;
  next: boolean;
}
