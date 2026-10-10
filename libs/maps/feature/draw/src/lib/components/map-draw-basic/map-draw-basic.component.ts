import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { BaseDrawComponent } from '../base/base.component';
import { NgClass } from '@angular/common';

@Component({
  selector: 'tamu-gisc-map-draw-basic',
  templateUrl: './map-draw-basic.component.html',
  styleUrls: ['./map-draw-basic.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [NgClass]
})
export class MapDrawBasicComponent extends BaseDrawComponent implements OnInit {}
