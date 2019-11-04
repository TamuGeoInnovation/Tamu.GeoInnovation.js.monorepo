import { Injectable, OnDestroy, OnInit } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocationService implements OnDestroy {
  public supportsGeolocation: boolean;
  public watchId: number = 0;

  constructor() { 
    if (navigator.geolocation) {
      this.supportsGeolocation = true;
      this.watchId = navigator.geolocation.watchPosition(this.locationUpdate, this.locationError, {
        timeout: 10000, // I'm assuming this is milliseconds (10 seconds)
        enableHighAccuracy: true,
        maximumAge: 20000, // I'm assuming this is milliseconds (20 seconds)
      });
    } else {
      this.supportsGeolocation = false;
    }
  }

  locationUpdate(position) {
    console.log(position.coords);
    // alert("Lat: " + position.coords.latitude + "\nLon: " + position.coords.longitude);
  }

  locationError(err) {
    console.error(err);
  }

  ngOnDestroy() {
    navigator.geolocation.clearWatch(this.watchId);
  }
}
