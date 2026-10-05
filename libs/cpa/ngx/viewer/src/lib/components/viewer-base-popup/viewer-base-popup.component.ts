import { Component } from '@angular/core';

import { BasePopupComponent } from '@tamu-gisc/maps/feature/popup';

@Component({
    selector: 'tamu-gisc-viewer-base-popup',
    templateUrl: './viewer-base-popup.component.html',
    styleUrls: ['./viewer-base-popup.component.scss'],
    standalone: false
})
export class ViewerBasePopupComponent extends BasePopupComponent {}
