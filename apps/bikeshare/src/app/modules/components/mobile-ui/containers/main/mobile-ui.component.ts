import { Component, OnInit } from '@angular/core';

import { UIDragService } from '../../../../services/ui/ui-drag.service';

@Component({
  selector: 'app-mobile-ui',
  templateUrl: './mobile-ui.component.html',
  styleUrls: ['./mobile-ui.component.scss'],
  providers: [UIDragService]
})
export class MobileUIComponent implements OnInit {
  constructor() {}

  public ngOnInit() {}
}
