import { Component, ChangeDetectionStrategy } from '@angular/core';

import { BasePopupComponent } from '@tamu-gisc/maps/feature/popup';

@Component({
  selector: 'tamu-gisc-viewer-base-popup',
  templateUrl: './viewer-base-popup.component.html',
  styleUrls: ['./viewer-base-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class ViewerBasePopupComponent extends BasePopupComponent {}
