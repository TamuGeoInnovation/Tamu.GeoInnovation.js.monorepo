import { Component, ChangeDetectionStrategy } from '@angular/core';

import { AbstractSlidingDrawerComponent } from '../../abstracts/abstract-sliding-drawer/abstract-sliding-drawer.component';
import { NgClass } from '@angular/common';

@Component({
  selector: 'tamu-gisc-drawer',
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [NgClass]
})
export class DrawerComponent extends AbstractSlidingDrawerComponent {}
