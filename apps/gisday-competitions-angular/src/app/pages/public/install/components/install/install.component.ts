import { Component, OnInit } from '@angular/core';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { BehaviorSubject } from 'rxjs';
import { catchError, take } from 'rxjs/operators';

import { Device, IDeviceOSVersion } from '@tamu-gisc/common/utils/device';
import { TrackLocation } from '@tamu-gisc/common/utils/geometry/generic';

@Component({
  selector: 'tamu-gisc-install',
  templateUrl: './install.component.html',
  styleUrls: ['./install.component.scss']
})
export class InstallComponent implements OnInit {
  public device: Device;
  public version: IDeviceOSVersion;

  public locationRequested: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(private readonly ns: NotificationService) {}

  public ngOnInit() {
    this.device = new Device();
    this.version = this.device.OSVersion();
  }

  public initiateLocationRequest() {
    if (this.locationRequested.getValue() === false) {
      this.locationRequested.next(true);

      const l = new TrackLocation({ enableHighAccuracy: true, maximumAge: 10000, timeout: 2500 })
        .track()
        .pipe(
          take(1),
          catchError((err) => {
            this.ns.preset('no_gps');

            throw new Error('Location forbidden');
          })
        )
        .subscribe((res) => {
          this.ns.toast({
            id: 'location-request-success',
            title: 'Location Access Granted',
            message:
              'Your device has successfully granted location access to this application! You can now upload submissions'
          });
        });
    }
  }
}
