import { Component } from '@angular/core';

import { DragService } from '@tamu-gisc/ui-kits/ngx/interactions/draggable';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'tamu-gisc-aggiemap-ngx-ui-mobile',
  templateUrl: './aggiemap-ngx-ui-mobile.component.html',
  styleUrls: ['./aggiemap-ngx-ui-mobile.component.scss'],
  providers: [DragService],
  imports: [RouterOutlet]
})
export class AggiemapNgxUiMobileComponent {}
