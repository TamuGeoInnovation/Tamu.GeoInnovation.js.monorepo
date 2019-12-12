import { Component, OnInit } from '@angular/core';

import { BasePopupComponent } from '@tamu-gisc/maps/feature/popup';

@Component({
  selector: 'tamu-gisc-sign',
  templateUrl: './sign.component.html',
  styleUrls: ['./sign.component.scss']
})
export class SignComponent extends BasePopupComponent implements OnInit {
  constructor() {
    super();
  }

  public ngOnInit() {}
}
