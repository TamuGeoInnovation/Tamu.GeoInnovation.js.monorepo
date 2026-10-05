import { Component, OnInit } from '@angular/core';

import { BaseDrawComponent } from '../base/base.component';

@Component({
    selector: 'tamu-gisc-map-draw-basic',
    templateUrl: './map-draw-basic.component.html',
    styleUrls: ['./map-draw-basic.component.scss'],
    standalone: false
})
export class MapDrawBasicComponent extends BaseDrawComponent implements OnInit {}
