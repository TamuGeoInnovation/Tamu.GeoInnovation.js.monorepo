import { Injectable, InjectionToken, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { pluck } from 'rxjs/operators';

const _initialState: TestingStore = { isTesting: false, next: false };

/**
 * Whether a development host was asked to behave as production (#1722).
 *
 * False unless an application provides it. AggieMap provides its `actingAsProduction()`, which reads
 * `?as=production`; the decision lives there and not here because the file that chooses AggieMap's GIS
 * server needs it too, and that file may import nothing from outside its own library.
 */
export const ACTING_AS_PRODUCTION = new InjectionToken<boolean>('ACTING_AS_PRODUCTION', {
  providedIn: 'root',
  factory: () => false
});

@Injectable({ providedIn: 'root' })
export class TestingService {
  private _store: BehaviorSubject<TestingStore> = new BehaviorSubject(_initialState);
  public store: Observable<TestingStore> = this._store.asObservable();

  private readonly _actingAsProduction = inject(ACTING_AS_PRODUCTION);

  constructor() {
    this._determineTestingMode();
  }

  /**
   * Whether this is a development host that was asked to behave as production (#1722). Development
   * features are then off, as `isTesting` reports, and the page should say why.
   */
  public get actingAsProduction(): boolean {
    return this._developmentHost && this._actingAsProduction;
  }

  private get _developmentHost(): boolean {
    return window.location.host.includes('dev') || window.location.host.includes('localhost');
  }

  /**
   * Whether this is a development host, now. Settled in the constructor, so it never changes after
   * injection - for code building a configuration synchronously, where `get('isTesting')` would mean
   * subscribing to read a value that is already known.
   */
  public get isTesting(): boolean {
    return this._store.value.isTesting;
  }

  public get(property: keyof TestingStore) {
    return this.store.pipe(pluck(property));
  }

  public set(property: string, value: unknown) {
    const state = { ...this._store.value, [property]: value };

    this._store.next(state);
  }

  private _determineTestingMode() {
    // "A development host, and not acting as production": the switch can turn this off and never on.
    if (this._developmentHost && !this._actingAsProduction) {
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
