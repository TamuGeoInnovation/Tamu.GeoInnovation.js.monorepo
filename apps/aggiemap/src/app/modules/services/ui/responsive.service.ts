import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class ResponsiveService {
  private _isMobile: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public screenWidth: number;

  constructor() {
    this.checkWidth();
  }

  private onStatusChange(status: boolean) {
    this._isMobile.next(status);
  }

  private checkWidth() {
    const width = window.innerWidth;
    if (width <= 768) {
      this.screenWidth = width;
      this.onStatusChange(true);
    } else if (width > 768 && width <= 992) {
      this.screenWidth = width;
      this.onStatusChange(false);
    } else {
      this.screenWidth = width;
      this.onStatusChange(false);
    }
  }

  public getStatus(): Observable<boolean> {
    return this._isMobile.asObservable();
  }

  public get snapshot(): ResponsiveSnapshot {
    return {
      isMobile: this._isMobile.value,
      screenWidth: this.screenWidth
    };
  }
}

export interface ResponsiveSnapshot {
  isMobile: boolean;
  screenWidth: number;
}
