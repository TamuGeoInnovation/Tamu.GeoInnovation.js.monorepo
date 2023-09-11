import { Component, OnInit, ViewContainerRef } from '@angular/core';

import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

@Component({
  selector: 'tamu-gisc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private readonly vcr: ViewContainerRef, private readonly ms: ModalService) {}

  public ngOnInit(): void {
    this.ms.registerGlobalViewRef(this.vcr);
  }
}

