import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LocalStoreModule } from '@tamu-gisc/common/ngx/local-store';

import { NotificationContainerComponent } from './components/notification-container/notification-container.component';
import { NotificationItemComponent } from './components/notification-item/notification-item.component';

import { NotificationService } from './services/notification.service';

@NgModule({
  declarations: [NotificationContainerComponent, NotificationItemComponent, NotificationContainerComponent],
  imports: [CommonModule, LocalStoreModule],
  providers: [NotificationService],
  exports: [NotificationContainerComponent, NotificationItemComponent]
})
export class NotificationModule {}
