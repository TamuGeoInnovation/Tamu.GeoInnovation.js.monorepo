import { Component, OnInit, ViewContainerRef } from '@angular/core';

import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

@Component({
  selector: 'tamu-gisc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public hideInstructions: boolean;
  public selectedRow: Record<string, unknown>;
  public coordinateOverride: { lat: number; lon: number };

  constructor(private readonly viewRef: ViewContainerRef, private readonly ms: ModalService) {}

  public ngOnInit() {
    this.ms.registerGlobalViewRef(this.viewRef);
  }
}
