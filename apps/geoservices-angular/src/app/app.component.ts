import { Component, OnInit, ViewContainerRef, ChangeDetectionStrategy } from '@angular/core';

import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { RouterOutlet } from '@angular/router';
import { NotificationContainerComponent } from '@tamu-gisc/common/ngx/ui/notification';

@Component({
  selector: 'tamu-gisc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterOutlet, NotificationContainerComponent]
})
export class AppComponent implements OnInit {
  constructor(
    private readonly vcr: ViewContainerRef,
    private readonly ms: ModalService
  ) {}

  public ngOnInit(): void {
    this.ms.registerGlobalViewRef(this.vcr);
  }
}
