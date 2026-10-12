import { Component, OnInit, ViewContainerRef, ChangeDetectionStrategy, inject } from '@angular/core';

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
  private readonly viewRef = inject(ViewContainerRef);
  private readonly ms = inject(ModalService);

  public ngOnInit(): void {
    this.ms.registerGlobalViewRef(this.viewRef);
  }
}
