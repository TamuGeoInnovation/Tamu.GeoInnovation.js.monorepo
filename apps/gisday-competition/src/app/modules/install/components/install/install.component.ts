import { Component, OnInit } from '@angular/core';

import { getMobileOS, IOperatingSystemIdentity } from '@tamu-gisc/common/utils/device';

@Component({
  selector: 'tamu-gisc-install',
  templateUrl: './install.component.html',
  styleUrls: ['./install.component.scss']
})
export class InstallComponent implements OnInit {
  public device: IOperatingSystemIdentity;
  constructor() {}

  public ngOnInit() {
    this.device = getMobileOS();
  }
}
