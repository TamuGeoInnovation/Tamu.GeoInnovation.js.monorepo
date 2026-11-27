import { Injectable } from '@angular/core';
import { BehaviorSubject, debounceTime, filter, fromEvent, map, startWith } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ResponsiveService {
  public _state: BehaviorSubject<ResponsiveSnapshot> = new BehaviorSubject<ResponsiveSnapshot>(
    this._checkWidth({ target: window })
  );
  public isMobile = this._state.asObservable().pipe(
    filter((mobile) => {
      return mobile !== null;
    }),
    map((state) => state.isMobile)
  );

  constructor() {
    this._init();
  }

  private _init() {
    // Subscribe to window resize events and update the state
    fromEvent(window, 'resize')
      .pipe(
        startWith({ target: window }),
        debounceTime(100),
        // filter((event) => event.currentTarget !== null),
        map((event) => this._checkWidth(event))
      )
      .subscribe(this._state);
  }

  private _checkWidth(event: Event | { target: Window }): ResponsiveSnapshot {
    const screenWidth = (event.target as Window).innerWidth;

    return { screenWidth, isMobile: screenWidth <= 768 };
  }

  public get snapshot(): ResponsiveSnapshot {
    return this._state.getValue();
  }
}

export interface ResponsiveSnapshot {
  isMobile: boolean;
  screenWidth: number;
}
