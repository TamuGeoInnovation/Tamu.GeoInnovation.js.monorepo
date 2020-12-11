import { Component, OnInit } from '@angular/core';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-base-popup-component',
  templateUrl: './base.popup.component.html'
})
export class BasePopupComponent implements OnInit {
  /**
   * Data set by the parent popup component.
   */
  public data: esri.Graphic;

  constructor() {}

  public ngOnInit(): void {}
}
