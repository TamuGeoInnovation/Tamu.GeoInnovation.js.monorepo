import { Component } from '@angular/core';

import { AbstractSlidingDrawerComponent } from '../../abstracts/abstract-sliding-drawer/abstract-sliding-drawer.component';
import { slide } from '../../animations/drawer';

@Component({
  selector: 'tamu-gisc-drawer',
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.scss'],
  animations: [slide]
})
export class DrawerComponent extends AbstractSlidingDrawerComponent {}
