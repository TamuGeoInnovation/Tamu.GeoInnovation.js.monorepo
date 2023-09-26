import { Injectable } from '@angular/core';
import { BehaviorSubject, debounceTime, filter, fromEvent, map, startWith } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ResponsiveService {
  public _state: BehaviorSubject<ResponsiveSnapshot> = new BehaviorSubject<ResponsiveSnapshot>(
    this._checkWidth({ currentTarget: window })
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
        startWith({ currentTarget: window }),
        debounceTime(100),
        map((event) => this._checkWidth(event))
      )
      .subscribe(this._state);
  }

  private _checkWidth(event: Event | { currentTarget: Window }) {
    const ret = {
      screenWidth: (event.currentTarget as Window).innerWidth,
      isMobile: undefined
    };

    if (ret.screenWidth <= 768) {
      ret.isMobile = true;
    } else {
      ret.isMobile = false;
    }

    return ret;
  }

  public get snapshot(): ResponsiveSnapshot {
    return this._state.getValue();
  }
}

export interface ResponsiveSnapshot {
  isMobile: boolean;
  screenWidth: number;
}
