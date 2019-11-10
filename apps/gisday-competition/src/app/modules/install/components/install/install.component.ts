import { Component, OnInit } from '@angular/core';

import { Device, IDeviceOSVersion } from '@tamu-gisc/common/utils/device';

@Component({
  selector: 'tamu-gisc-install',
  templateUrl: './install.component.html',
  styleUrls: ['./install.component.scss']
})
export class InstallComponent implements OnInit {
  public device: Device;
  public deviceOSVersion: IDeviceOSVersion;
  constructor() {}

  public ngOnInit() {
    this.device = new Device();
    this.deviceOSVersion = this.device.OSVersion();
  }
}
