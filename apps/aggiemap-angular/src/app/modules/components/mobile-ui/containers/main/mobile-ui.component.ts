import { Component, OnInit } from '@angular/core';

import { DragService } from '@tamu-gisc/ui-kits/ngx/interactions/draggable';
@Component({
  selector: 'app-mobile-ui',
  templateUrl: './mobile-ui.component.html',
  styleUrls: ['./mobile-ui.component.scss'],
  providers: [DragService]
})
export class MobileUIComponent implements OnInit {
  constructor() {}

  public ngOnInit() {}
}
