import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { IGeoLocal } from '../entity/submission.entity';

@Injectable({
  providedIn: 'root'
})
export class LocationService implements OnDestroy {
  public supportsGeolocation: boolean;
  public watchId = 0;
  public currentLocal: IGeoLocal;

  constructor() {
    if (navigator.geolocation) {
      this.supportsGeolocation = true;
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          this.currentLocal = {
            lat: `${position.coords.latitude}`,
            lon: `${position.coords.longitude}`,
            timestamp: Date.now().toString(),
            accuracy: `${position.coords.accuracy}`
          };
        },
        this.locationError,
        {
          timeout: 10 * 1000, // I'm assuming this is milliseconds (10 seconds)
          enableHighAccuracy: true,
          maximumAge: 20 * 1000 // I'm assuming this is milliseconds (20 seconds)
        }
      );
    } else {
      this.supportsGeolocation = false;
    }
  }

  public locationError(err) {
    console.dir(err);
    // error.code can be:
    //   0: unknown error
    //   1: permission denied
    //   2: position unavailable (error response from location provider)
    //   3: timed out
  }

  public ngOnDestroy() {
    navigator.geolocation.clearWatch(this.watchId);
  }
}
